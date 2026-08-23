/**
 * Converts an IscDocument (parsed from .isc source) to a CompiledMapJson
 * (the runtime representation consumed by the existing TS runtime).
 *
 * This bridges the ISC parser output to the existing runtime without
 * modifying any runtime code (OCP).
 */
export function iscToCompiledMap(doc) {
    const aliases = {};
    for (const a of doc.aliases) {
        aliases[a.name] = convertItem(a.value);
    }
    // Build alias → target system code map for run-rule resolution.
    const depAliases = new Map();
    for (const d of doc.dependencies) {
        if (d.aliasName)
            depAliases.set(d.aliasName, d.target);
    }
    const resolveDep = (name) => depAliases.get(name) ?? name;
    const stages = doc.stages.map((s) => convertStage(s, resolveDep));
    if (Object.keys(doc.metadata).length === 0) {
        return {
            schemaVersion: 1,
            systemCode: doc.systemCode,
            dependencies: doc.dependencies.map((d) => d.target),
            stages,
            aliases,
            functions: {},
        };
    }
    return {
        schemaVersion: 1,
        systemCode: doc.systemCode,
        dependencies: doc.dependencies.map((d) => d.target),
        metadata: doc.metadata,
        stages,
        aliases,
        functions: {},
    };
}
function convertStage(stage, resolveDep) {
    return {
        kind: "stage",
        name: stage.name,
        rules: stage.body.map((item) => convertStageItem(item, resolveDep)),
    };
}
function convertStageItem(item, resolveDep) {
    switch (item.kind) {
        case "parallel": {
            const r = { kind: "parallel", rules: item.rules.map(convertRule) };
            return r;
        }
        case "sequence": {
            const r = { kind: "sequential", rules: item.rules.map(convertRule) };
            return r;
        }
        case "bare_rule":
            return convertRule(item.rule);
        case "run": {
            const r = item.dependency
                ? { kind: "run", stage: item.stage, docName: resolveDep(item.dependency) }
                : { kind: "run", stage: item.stage };
            return r;
        }
        case "separate": {
            if (item.separator && item.separator.type === "string") {
                const r = { kind: "funcall", name: "separate", kwargs: { separator: item.separator.value } };
                return r;
            }
            const r = { kind: "funcall", name: "separate" };
            return r;
        }
        case "compose": {
            const r = { kind: "funcall", name: "compose" };
            return r;
        }
        case "decompose": {
            const r = { kind: "funcall", name: "decompose" };
            return r;
        }
        case "string_case": {
            const r = { kind: "funcall", name: item.op };
            return r;
        }
        case "funcall": {
            const r = { kind: "funcall", name: item.name, kwargs: item.kwargs };
            return r;
        }
    }
}
function convertRule(rule) {
    const before = findConstraint(rule, "before");
    const after = findConstraint(rule, "after");
    const notBefore = findConstraint(rule, "not_before");
    const notAfter = findConstraint(rule, "not_after");
    // `to` may be a function (upcase/downcase/title_case/etc.) — represented
    // as FuncallInline rather than an Item.
    const toItem = rule.to;
    const to = toItem.type === "function"
        ? { kind: "funcall_inline", name: toItem.name }
        : convertItem(toItem);
    const r = {
        kind: "sub",
        from: convertItem(rule.from),
        to,
        ...(before !== undefined ? { before } : {}),
        ...(after !== undefined ? { after } : {}),
        ...(notBefore !== undefined ? { notBefore } : {}),
        ...(notAfter !== undefined ? { notAfter } : {}),
    };
    return r;
}
function findConstraint(rule, kind) {
    const c = rule.constraints.find((x) => x.kind === kind);
    return c ? convertItem(c.item) : undefined;
}
function convertItem(item) {
    switch (item.type) {
        case "string": {
            const r = { kind: "string", value: item.value };
            return r;
        }
        case "none": {
            const r = { kind: "string", value: "" };
            return r;
        }
        case "primitive": {
            const r = { kind: "alias", name: item.name };
            return r;
        }
        case "function": {
            // Functions in non-`to` positions are unexpected — fall back to alias
            // lookup so a clear error surfaces at runtime.
            const r = { kind: "alias", name: item.name };
            return r;
        }
        case "alias_ref": {
            const r = { kind: "alias", name: item.name };
            return r;
        }
        case "capture": {
            const r = { kind: "capture_ref", id: item.index };
            return r;
        }
        case "capture_group": {
            const r = { kind: "capture_group", data: convertItem(item.inner) };
            return r;
        }
        case "concat": {
            const parts = item.parts.map(convertItem);
            if (parts.length === 1)
                return parts[0];
            const r = { kind: "group", items: parts };
            return r;
        }
        case "set": {
            const r = { kind: "any", of: item.items.map(convertItem) };
            return r;
        }
        case "range": {
            const r = { kind: "any_char_class", range: [item.lo, item.hi] };
            return r;
        }
        case "maybe": {
            const r = { kind: "repeat", item: convertItem(item.inner), min: 0, max: 1 };
            return r;
        }
        case "some": {
            const r = { kind: "repeat", item: convertItem(item.inner), min: 1, max: null };
            return r;
        }
    }
}
//# sourceMappingURL=converter.js.map