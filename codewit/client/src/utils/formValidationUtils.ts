export const isFormValid = (formData: any, requiredFields: string[]): boolean => {
  return requiredFields.every((field) => {
    const value = formData[field];
    return value && value.length > 0;
  });
};