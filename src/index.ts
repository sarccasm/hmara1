import express from 'express';
import { Pool } from 'pg';

const app = express();
app.use(express.json());
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', service: 'cloud-tasks-api' });
  } catch {
    res.status(503).json({ status: 'unavailable', database: 'disconnected' });
  }
});

app.get('/tasks', async (_req, res) => {
  try {
    const result = await pool.query('SELECT id, title, completed, created_at FROM tasks ORDER BY id');
    res.json(result.rows);
  } catch { res.status(500).json({ error: 'Database error' }); }
});

app.post('/tasks', async (req, res) => {
  const title = req.body?.title;
  if (typeof title !== 'string' || !title.trim() || title.length > 200) {
    res.status(400).json({ error: 'title must be a non-empty string of at most 200 characters' });
    return;
  }
  try {
    const result = await pool.query('INSERT INTO tasks (title) VALUES ($1) RETURNING *', [title.trim()]);
    res.status(201).json(result.rows[0]);
  } catch { res.status(500).json({ error: 'Database error' }); }
});

app.patch('/tasks/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0 || typeof req.body?.completed !== 'boolean') {
    res.status(400).json({ error: 'Valid id and boolean completed required' });
    return;
  }
  try {
    const result = await pool.query('UPDATE tasks SET completed=$1 WHERE id=$2 RETURNING *', [req.body.completed, id]);
    if (!result.rows.length) { res.status(404).json({ error: 'Task not found' }); return; }
    res.json(result.rows[0]);
  } catch { res.status(500).json({ error: 'Database error' }); }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, '0.0.0.0', () => console.log(`API listening on ${port}`));
