const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { query } = require('../database');
const { generateToken, authenticate } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty(),
  body('inviteCode').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, name, inviteCode } = req.body;

  try {
    // Check if user exists
    const existingUser = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Validate invite code
    const invite = await query(`
      SELECT * FROM invite_codes 
      WHERE code = $1 AND used_by IS NULL 
      AND (expires_at IS NULL OR expires_at > NOW())
    `, [inviteCode]);

    if (invite.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired invite code' });
    }

    const inviteData = invite.rows[0];
    if (inviteData.max_uses && inviteData.current_uses >= inviteData.max_uses) {
      return res.status(400).json({ error: 'Invite code has reached maximum uses' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userResult = await query(`
      INSERT INTO users (email, name, password_hash, role)
      VALUES ($1, $2, $3, 'user')
      RETURNING id, email, name, role
    `, [email, name, passwordHash]);

    const user = userResult.rows[0];

    // Update invite code
    await query(`
      UPDATE invite_codes 
      SET used_by = $1, used_at = NOW(), current_uses = current_uses + 1
      WHERE id = $2
    `, [user.id, inviteData.id]);

    // Create default settings
    await query('INSERT INTO app_settings (user_id) VALUES ($1)', [user.id]);

    // Generate token
    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ user, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role,
        avatar_url: user.avatar_url
      },
      token 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await query(`
      SELECT id, email, name, role, avatar_url, created_at 
      FROM users WHERE id = $1
    `, [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

module.exports = router;
