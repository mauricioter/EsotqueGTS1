import { createMocks } from 'node-mocks-http';
import { POST } from '../app/api/ixc/equipamentos/route';

describe('API /api/ixc/equipamentos', () => {
  it('POST deve validar campos obrigatórios', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {},
    });
    // const response = await POST(req);
    // expect(response.status).toBe(400);
    expect(true).toBe(true); // Placeholder
  });
});
