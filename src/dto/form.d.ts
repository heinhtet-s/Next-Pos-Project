"use client";
import * as z from "zod";
export type ChangeEventTypes =
  | SelectChangeEvent<string | number>
  | React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  | React.ChangeEventHandler<HTMLSelectElement>;
