//function read-eval-print-loop
function repl() 
{
  var stdin = process.stdin, stdout = process.stdout;
  stdin.resume();
  stdout.write("lisp.js>>> ");
  stdin.on('data',function(data)
		  {
  			data = (data + "").trim();
  			var result = eval(read(data));
  			if (result != undefined)
    				stdout.write(result+'\nlisp.js>>> ');
  			else
    				stdout.write('lisp.js>>> ');
		  });
}
repl()

//function: parse the given data 
function read(data)
{
  return read_from(tokenize(data));
}

//function: make tokens from given data
function tokenize(s)
{
  return s.replace(/\(/g,' ( ').replace(/\)/g, ' ) ').trim().split(/\s+/);
}

//function:each token read and meaningful token stored in a list 
function read_from(token_list)
{
  if (token_list.length==0)
    console.log("Syntax error, Unexpected EOF");
  var token=token_list.shift();
  if (token=='(')
    {
	var list=[]
	while (token_list[0]!==')')
	{
	  list.push(read_from(token_list));
	}
	token_list.shift();
	console.log(list);
	return list;
    }
  else
    {
	if (token==')')
	  console.log("Syntax error:");
	else
	  return token_check(token);
    }
}


//function: check token category
function token_check(token)
{
  if (isNaN(token))
	return token;
  else
	return parseFloat(token);
}


//An environment: a dict of {'var':val} pairs
function Env(dict)
{
  var env={},outer=dict.outer || {};
  if (dict.parms.length!=0)
  {
    	for (var i=0;i<dict.parms.length;i+=1)
     	  env[dict.parms[i]]=dict.args[i];
  }
  env.find=function(variable)
  {
   	if (env.hasOwnProperty(variable))
     	  return env;
   	else
   	  return outer.find(variable);
   
  }
  return env;
}


//function: operation of each environment
function add_globals(env)
{
  env['+'] = function(a,b) {return a+b;}
  env['-'] = function (a,b) {return a-b;}
  env['*'] = function (a,b) {return a*b;}
  env['/'] = function (a,b) {return a/b;}
  env['>'] = function (a,b) {return a>b;}
  env['<'] = function (a,b) {return a<b;}
  env['>='] = function (a,b) {return a>=b;}
  env['<='] = function (a,b) {return a<=b;}
  env['=='] = function (a,b) {return a==b;}
  env['remainder']=function(a,b) {return a%b;}
  env['equal?'] = function (a,b) {return a==b;}
  env['eq?'] = function (a,b) {return a==b;}
  env['not'] = function (a) {return !a;}
  env['length'] = function (a) { return a.length; }
  env['cons'] = function (a,b) {return [a].concat(b); }
  env['car'] = function (a) { return (a.length !==0) ? a[0] : null;}
  env['cdr'] = function (a) { return (a.length>1) ? a.slice(1) : null;}
  env['append'] = function (a,b) { return a.concat(b); }
  env['list'] = function () {return Array.prototype.slice.call(arguments);}
  env['list?'] = function (a) { return (a instanceof Array);}
  env['null?'] = function (a) { return (a.length == 0); }
  env['symbol?'] = function (a) { return (typeof a == 'string') ;}
  return env;
}

var global_env=add_globals(Env({parms:[],args:[],outer:undefined}));

//function: evaluate an expression in an environment
function eval(x,env)
{
  env=env || global_env;
  if (typeof x==='string')
    return env.find(x.valueOf())[x.valueOf()];
  else if (typeof x==='number')
    return x;
  else if (x[0]==='quote')
    return x[1];
  else if (x[0]=='if')
  {
	var test=x[1],conseq=x[2],alt=x[3];
    	if (eval(test,env))
          return eval(conseq,env);
    	else
          return eval(alt,env);
  }
  else if(x[0]==='set!')
    env.find(x[1])[x[1]]=eval(x[2],env);
  else if (x[0]==='define')
    env[x[1]]=eval(x[2],env);
  else if (x[0]==='lambda')
  {
   	var vars=x[1],exp=x[2];
   	return function()
   	{
    	  return eval(exp,Env({parms:vars,args:arguments,outer:env}));
       	};
  }
  else if (x[0]==='begin')
  {
   	var val;
   	for (var i=1;i<x.length;i+=1)
   	  val=eval(x[i],env);
   	return val;
  }
  else
  {
   	var exps=[];
   	for (i=0;i<x.length;i+=1)
     	  exps[i]=eval(x[i],env);
   	var proc=exps.shift();
   	return proc.apply(env,exps);
  }
}

