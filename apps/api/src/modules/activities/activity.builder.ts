import { CreateActivityDto } from "./dto/create-activity.dto";
import { IActivityBuilder } from "./Interfaces/activity.interface";

export class ActivityBuilder implements IActivityBuilder
{
    private title: string = '';
    private description?: string = '';
    private category: string = '';
    private city: string = '';
    private price?: number;
    private capacity?: number;
    private startDate?: string = ''; 

    setTitle(title: string): this
    {
        this.title = title;
        return this;
    }
    setDescription(description?: string): this
    {
        this.description = description;
        return this;
    }
    setCategory(category: string): this
    {
        this.category = category;
        return this;
    }
    setCity(city: string): this
    {
        this.city = city;
        return this;
    }
    setPrice(price?: number): this
    {
        this.price = price;
        return this;
    }
    setCapacity(capacity?: number): this
    {
        this.capacity = capacity;
        return this;
    }
    setStartDate(startDate?: string): this
    {
        this.startDate = startDate;
        return this;
    }
    build(): any
    {
        return {
            title: this.title,
            description: this.description,
            category: this.category,
            city: this.city,
            price: this.price ?? 0,
            capacity: this.capacity ?? 50,
            startDate: this.startDate ?? new Date(). toISOString(),
        };
    }
    static fromDto(dto: CreateActivityDto): ActivityBuilder
    {
        return new ActivityBuilder()
        .setTitle(dto.title)
        .setDescription(dto.description)
        .setCategory(dto.category)
        .setCity(dto.city)
        .setPrice(dto.price)
        .setCapacity(dto.capacity)
        .setStartDate(dto.startDate);
    }
}