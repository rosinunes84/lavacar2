import { supabase } from './supabase-config.js';

document.getElementById('btn-logout').addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = 'login.html';
});
