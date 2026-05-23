routerAdd('GET', '/api/v1/debug-auth-test2', (c) => {
  try {
    var authHeader = c.requestInfo().headers['authorization'];
    if (!authHeader) return c.json(200, { error: 'No auth header' });
    
    var parts = String(authHeader).split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return c.json(200, { error: 'Invalid header format' });
    }
    
    var token = parts[1].trim();
    var hashed = (function(tok) { try { return $security.SHA256(tok); } catch(e){ var h=0;if(tok.length===0)return'd';for(var i=0;i<tok.length;i++){h=((h<<5)-h)+tok.charCodeAt(i);h=h&h;}return'd_'+Math.abs(h).toString(16).padStart(8,'0');} })(token);
    
    var tokens = $app.findRecordsByFilter('api_tokens','token_hash = "'+hashed+'"','',1,0);
    
    // Also try the global bearerAuthMiddleware
    var baResult = null;
    if (typeof bearerAuthMiddleware !== 'undefined') {
      baResult = bearerAuthMiddleware(c);
    } else {
      baResult = { error: 'bearerAuthMiddleware not defined' };
    }
    
    return c.json(200, {
      token_prefix: token.substring(0, 10) + '...',
      hash: hashed,
      tokens_found: tokens.length,
      token_info: tokens.length > 0 ? { id: tokens[0].id, name: String(tokens[0].get('name')||''), enabled: tokens[0].get('enabled') } : null,
      ba_result: baResult,
      api_token_info: c.get('apiTokenInfo')
    });
  } catch(e) {
    return c.json(500, { error: String(e), stack: String(e.stack||'') });
  }
});
