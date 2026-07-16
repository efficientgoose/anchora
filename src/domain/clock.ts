export interface Clock {
  today(): Date;
}

export class FixedDemoClock implements Clock {
  today() {
    return new Date(2026, 6, 13, 12, 0, 0, 0);
  }
}

export const demoClock = new FixedDemoClock();
