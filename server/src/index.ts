import 'dotenv/config';
import express from 'express';
import { resolve } from 'node:path';
import { createProductRouter, FakeStoreSource } from './products';
import { createEnquiryRouter, SmtpEmailGateway } from './enquiries';
import { apiErrorResponse } from './errors';

const app = express();
const source = new FakeStoreSource();
app.use(express.json({ limit: '16kb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api', createProductRouter(source));
app.use('/api', createEnquiryRouter(source, new SmtpEmailGateway()));
app.use(express.static(resolve(process.cwd(), 'client/dist')));
app.get(/.*/, (_req, res, next) => res.sendFile(resolve(process.cwd(), 'client/dist/index.html'), (error) => { if (error) next(error); }));
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  const result = apiErrorResponse(error);
  res.status(result.status).json(result.body);
});

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => console.log(`Product catalogue API listening on http://localhost:${port}`));
