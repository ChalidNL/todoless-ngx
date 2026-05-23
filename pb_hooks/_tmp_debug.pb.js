routerAdd('GET', '/api/v1/debug-auth-test', (c) => {
  try {
    var hashed = (function(tok) { try { return $security.SHA256(tok); } catch(e){ var h=0;if(tok.length===0)return'd';for(var i=0;i<tok.length;i++){h=((h<<5)-h)+tok.charCodeAt(i);h=h&h;}return'd_'+Math.abs(h).toString(16).padStart(8,'0');} })("test123");
    var tokens = $app.findRecordsByFilter('api_tokens','token_hash = "'+hashed+'"','',1,0);
    return c.json(200, { sha256_works: typeof $security.SHA256 === 'function', hash: hashed, tokens_found: tokens.length });
  } catch(e) {
    return c.json(500, { error: String(e) });
  }
});
