export interface IdentificationClue {
    text: string;
    points: number;
    revealed: boolean;
}

export interface IdentificationQuestion {
    id: string;
    text: string;
    type: "identification";
    clues: IdentificationClue[];
    solution: string;
    imageUrl?: string;
}

// Si tu as déjà un type Question existant :
export type Question =
    | IdentificationQuestion
    | { type: "normal"; /* tes autres champs */ };