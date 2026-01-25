import { api } from "@/lib/api";

export interface Unit {
    id: string;
    unit: string; // "Block 1 Lot 2" or similar
    owner?: string;
    type: string;
    occupancy_status: string; // "VACANT", "OCCUPIED"
    membership_status: string; // "GOOD_STANDING", "DELINQUENT"
}

export const RegistryService = {
    getUnits: async () => {
        const response = await api.get<Unit[]>("/registry/units/");
        return response.data;
    },
};
