
export const formatPlaysCount = (count) => {
    if (count === null || count === undefined) return '0';

    const absCount = Math.abs(count);

    if (absCount < 1000) return count.toString();
    if (absCount < 1_000_000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    if (absCount < 1_000_000_000) return (count / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';

    return (count / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
};


export const toReadableDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}