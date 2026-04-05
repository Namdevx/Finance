const express = require('express');
const cors    = require('cors');
const { initSchema } = require('./models/db');

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use((req,_,next) => { console.log(`${req.method} ${req.path}`); next(); });
app.use('/api', require('./routes'));
app.use((_,res) => res.status(404).json({ error:'Route not found' }));
app.use((err,_,res,__) => { console.error(err); res.status(500).json({ error:'Server error' }); });

const PORT = process.env.PORT || 4000;
initSchema().then(() => {
  app.listen(PORT, () => console.log(`\n🚀 API running → http://localhost:${PORT}/api\n`));
}).catch(e => { console.error(e); process.exit(1); });
