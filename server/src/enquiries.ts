import { Router } from 'express';
import { z } from 'zod';
import nodemailer, { type Transporter } from 'nodemailer';
import type { ProductSource } from './products';
import { EmailDeliveryError } from './errors';

const enquirySchema = z.object({
  productId: z.number().int().positive(),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(10).max(2000),
});

export interface EmailGateway {
  send(input: { productId: number; name: string; email: string; message: string; productTitle: string }): Promise<void>;
}

export class SmtpEmailGateway implements EmailGateway {
  private transporter: Transporter;
  constructor(private readonly options = {
    host: process.env.SMTP_HOST ?? 'localhost',
    port: Number(process.env.SMTP_PORT ?? 1025),
    from: process.env.SMTP_FROM ?? 'catalogue@example.local',
    to: process.env.SALES_EMAIL ?? 'sales@example.local',
  }) {
    this.transporter = nodemailer.createTransport({ host: options.host, port: options.port, secure: false });
  }

  async send(input: { productId: number; name: string; email: string; message: string; productTitle: string }) {
    await this.transporter.sendMail({
      from: this.options.from, to: this.options.to, replyTo: input.email,
      subject: `Product enquiry: ${input.productTitle}`,
      text: `From: ${input.name} <${input.email}>\nProduct: ${input.productTitle} (#${input.productId})\n\n${input.message}`,
    });
  }
}

export function createEnquiryRouter(source: ProductSource, gateway: EmailGateway) {
  const router = Router();
  router.post('/enquiries', async (req, res, next) => {
    const parsed = enquirySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: { code: 'INVALID_ENQUIRY', message: 'Check the name, email, product and message fields.' } });
    try {
      const product = await source.byId(parsed.data.productId);
      if (!product) return res.status(404).json({ error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found.' } });
      try {
        await gateway.send({ ...parsed.data, productTitle: product.title });
      } catch {
        return next(new EmailDeliveryError());
      }
      return res.status(201).json({ message: 'Your enquiry has been sent.' });
    } catch (error) { return next(error); }
  });
  return router;
}
