export const maskCPF = (value: string) => {
    return value
        .replace(/\D/g, '') // Remove non-digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1') // Limit size
}

export const maskPhone = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1')
}

export const maskDate = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .replace(/(\d{4})\d+?$/, '$1')
}

export const maskCurrency = (value: string) => {
    const numeric = value.replace(/\D/g, '')
    const float = (Number(numeric) / 100).toFixed(2)
    return float
        .replace('.', ',')
        .replace(/(\d)(\d{3})(,)/, '$1.$2$3') // Thousand separator
}

/**
 * Removes all non-digit characters.
 * Use for fields that must be STRICTLY integer numbers (e.g. ID, Count).
 */
export const sanitizeNumeric = (value: string) => {
    return value.replace(/\D/g, '')
}

/**
 * Allows digits and a single decimal separator (dot or comma).
 * Converts comma to dot for standard parsing if needed, but visually keeps it friendly?
 * Actually for input sanitization, usually we want to allow typing '10,5'.
 * This function returns the raw string suitable for input value, not necessarily the float.
 */
export const sanitizeFloatInput = (value: string) => {
    // Allow digits and one comma or dot
    // Remove everything else
    let out = value.replace(/[^0-9,.]/g, '')

    // Ensure only one separator
    const match = out.match(/([,.])/)
    if (match) {
        const firstSeparatorIndex = match.index!
        const firstSeparator = match[0]
        const pre = out.substring(0, firstSeparatorIndex + 1)
        const post = out.substring(firstSeparatorIndex + 1).replace(/[,.]/g, '')
        out = pre + post
    }
    return out
}

/**
 * Removes numbers and special symbols (except accents).
 * Allows letters and spaces.
 */
export const sanitizeAlpha = (value: string) => {
    return value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')
}

/**
 * Guards a number within a range.
 * Returns the clamped value or the original if valid.
 */
export const guardRange = (value: number, min: number, max: number) => {
    if (isNaN(value)) return min
    if (value < min) return min
    if (value > max) return max
    return value
}
