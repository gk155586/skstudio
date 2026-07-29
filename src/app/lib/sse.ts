type SSEClient = {
  id: string;
  controller: ReadableStreamDefaultController;
};

const globalForSSE = global as unknown as { 
  sseClients: SSEClient[]; 
  pingInterval?: NodeJS.Timeout;
};

if (!globalForSSE.sseClients) {
  globalForSSE.sseClients = [];
}

// Start global 15-second heartbeat ping if not already running
if (!globalForSSE.pingInterval) {
  globalForSSE.pingInterval = setInterval(() => {
    if (globalForSSE.sseClients.length === 0) return;
    const encoder = new TextEncoder();
    const pingPayload = `: ping\n\n`;
    
    globalForSSE.sseClients = globalForSSE.sseClients.filter(client => {
      try {
        client.controller.enqueue(encoder.encode(pingPayload));
        return true;
      } catch (e) {
        return false;
      }
    });
  }, 15000);
}

export const sseHub = {
  addClient(id: string, controller: ReadableStreamDefaultController) {
    globalForSSE.sseClients.push({ id, controller });
    console.log(`[SSE Hub] Client registered: ${id}. Active Count: ${globalForSSE.sseClients.length}`);
  },

  removeClient(id: string) {
    globalForSSE.sseClients = globalForSSE.sseClients.filter(c => c.id !== id);
    console.log(`[SSE Hub] Client disconnected: ${id}. Active Count: ${globalForSSE.sseClients.length}`);
  },

  broadcast(event: string, data: any) {
    console.log(`[SSE Hub] Broadcasting "${event}" to ${globalForSSE.sseClients.length} connected clients.`);
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    const encoder = new TextEncoder();

    const deadClients: string[] = [];

    globalForSSE.sseClients.forEach(client => {
      try {
        client.controller.enqueue(encoder.encode(payload));
      } catch (e) {
        deadClients.push(client.id);
      }
    });

    if (deadClients.length > 0) {
      globalForSSE.sseClients = globalForSSE.sseClients.filter(c => !deadClients.includes(c.id));
      console.log(`[SSE Hub] Purged ${deadClients.length} stale SSE connections.`);
    }
  }
};

