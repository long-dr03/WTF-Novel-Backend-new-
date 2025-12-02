import { Request, Response } from 'express';

export const index = (req: Request, res: Response) => {
    res.json({ message: 'Welcome to the Novel Backend API' });
};

export const test = (req: Request, res: Response) => {
    res.send('hello world');
};

export const test1 = (req: Request, res: Response) => {
    res.send('hello world');
};
