export function hasFlag<T extends number>(value: T, flag: T): boolean {
    return (value & flag) === flag
}

export function getAllFlagValues<T extends number>(value: T, stringFunction: (n: number) => string | undefined): string[] {
    const list = []
    let i = 1
    while(stringFunction(i)){
        if(hasFlag(value, i))
            list.push(stringFunction(i))
        i *= 2
    }
    return list
}