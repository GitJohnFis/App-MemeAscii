export interface AsciiCharset {
  name: string;
  chars: string; // Characters ordered from "less ink" to "more ink"
  description?: string;
}

export const ASCII_CHARSETS: Record<string, AsciiCharset> = {
  standard: {
    name: "Standard",
    chars: " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
    description: "A comprehensive set for detailed gradients.",
  },
  simple: {
    name: "Simple",
    chars: " .:-=+*#%@",
    description: "Basic characters for a classic ASCII look.",
  },
  block: {
    name: "Block",
    chars: " ░▒▓█",
    description: "Uses block characters for a pixelated effect.",
  },
  detailed_alt: {
    name: "Detailed Alt",
    chars: " `.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5YxjAdPQPDSGFBJOMWX%#@$",
    description: "An alternative detailed character set.",
  },
  symbols: {
    name: "Symbols",
    chars: " .,*&%#@$+",
    description: "Uses common symbols for a unique texture.",
  },
};

export const DEFAULT_CHARSET_KEY = 'standard';
