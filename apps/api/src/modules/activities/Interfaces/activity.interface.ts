export interface IActivityBuilder
{
    setTitle(title: string): IActivityBuilder;
    setDescription(description?: string): IActivityBuilder;
    setCategory(category: string): IActivityBuilder;
    setCity(city: string): IActivityBuilder;
    setPrice(price?: number): IActivityBuilder;
    setCapacity(capacity?: number): IActivityBuilder;
    setStartDate(startDate?: string): IActivityBuilder;
    build(): any;
}