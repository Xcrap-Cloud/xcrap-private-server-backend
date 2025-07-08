import configHelper from "../helpers/config.helper"

const normalize = (text: string) => {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
}

export function generateUsernameFromName(fullName: string): string {
    const names = normalize(fullName).split(/\s+/).filter(Boolean)

    let base = ""

    if (names.length >= 2) {
        base = names[0].slice(0, 3) + names[names.length - 1].slice(0, 3)
    } else {
        base = names[0].slice(0, 6)
    }

    const randomSuffix = Math.random().toString(36).substring(2)

    const raw = (base + randomSuffix).substring(0, length)

    return raw.padEnd(configHelper.users.generatedUsernameLength, "0")
}
