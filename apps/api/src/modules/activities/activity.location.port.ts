import { Activity } from "@prisma/client";
import { FilterActivitiesDto } from "./dto/filter-activities.dto";

export type ActivityWithLocation = Activity & {
    latitude: number | null;
    longitude: number | null;
};

export abstract class ActivityLocationPort
{
    abstract findAll(filters: FilterActivitiesDto): Promise<ActivityWithLocation[]>;
    abstract findById(id: string): Promise<ActivityWithLocation | null>;
    abstract setCoordinates(id: string, latitude: number, longitude: number): Promise<void>;
}