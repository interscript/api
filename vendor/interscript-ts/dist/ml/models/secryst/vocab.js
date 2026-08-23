/**
 * Secryst vocabulary — port of `secryst/lib/secryst/vocab.rb`.
 *
 * Maps tokens to integer IDs (stoi) and back (itos). Supports
 * special tokens (<sos>, <eos>, <pad>) alongside character-level
 * vocab.
 */
export class Vocab {
    stoi;
    itos;
    length;
    constructor(tokens, specials = []) {
        const all = [...specials, ...tokens];
        this.itos = all;
        this.stoi = Object.freeze(Object.fromEntries(all.map((t, i) => [t, i])));
        this.length = all.length;
    }
    /** String to ID. Returns -1 for unknown tokens. */
    encode(token) {
        return this.stoi[token] ?? -1;
    }
    /** ID to string. Returns "" for unknown IDs. */
    decode(id) {
        return this.itos[id] ?? "";
    }
    /** Encode a string into a sequence of token IDs. */
    encodeSequence(text) {
        return Array.from(text).map((c) => this.encode(c));
    }
    /** Decode a sequence of token IDs back into a string. */
    decodeSequence(ids) {
        return ids.map((id) => this.decode(id)).join("");
    }
}
/**
 * Parse vocab data from YAML format (as stored in the model zip).
 * Uses js-yaml if available, otherwise a minimal YAML parser for
 * the simple list format secryst uses.
 */
export function parseVocabYaml(yaml) {
    // Secryst vocabs are simple YAML:
    //   input:
    //     - "<sos>"
    //     - "<eos>"
    //     - "a"
    //   target:
    //     - "<sos>"
    //     - ...
    //
    // We use a minimal parser instead of requiring js-yaml as a dep.
    const lines = yaml.split("\n");
    let section = null;
    const input = [];
    const target = [];
    for (const line of lines) {
        const trimmed = line.trimEnd();
        if (trimmed === "input:") {
            section = "input";
            continue;
        }
        if (trimmed === "target:") {
            section = "target";
            continue;
        }
        const match = trimmed.match(/^\s+-\s+"?(.+?)"?\s*$/);
        if (match && section) {
            const token = match[1];
            if (section === "input")
                input.push(token);
            else
                target.push(token);
        }
    }
    return { input, target };
}
/**
 * Build Vocab instances from parsed data.
 */
export function buildVocabs(data) {
    return {
        input: new Vocab(data.input),
        target: new Vocab(data.target),
    };
}
//# sourceMappingURL=vocab.js.map