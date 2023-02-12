export interface User {
  id: string;
  name: string;
}

export interface Game {
  name: string;
  id: string;
  admin: string;
  users: User[];
  rounds: Round[];
  status: "open" | "closed";
}

export interface Round {
  id: string;
  gameId: string;
  status: "open" | "closed";
  estimates: Estimate[];
  finalEstimate?: number | null;
}

export interface Estimate {
  id: string;
  userId: string;
  roundId: string;
  value: number;
}
