export const modifyfilename = (original) => {
    const extension = original.substring(original.lastIndexOf('.')).toLowerCase();
    let baseName = original.substring(0, original.lastIndexOf('.'));

    // Replace spaces and underscores with hyphens
    baseName = baseName.replace(/[\s_]+/g, "-");

    // Remove all non-alphanumeric characters except hyphens
    baseName = baseName.replace(/[^a-zA-Z0-9-]/g, '');

    // Trim to 20 characters and remove trailing hyphen if any
    baseName = baseName.substring(0, 35).replace(/-+$/, '');

    // Convert to lowercase
    baseName = baseName.toLowerCase();

    return { baseName, extension }

}