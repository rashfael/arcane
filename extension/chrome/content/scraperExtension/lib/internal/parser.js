/* Jison generated parser */
var parser = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"expressions":3,"u":4,"EOF":5,"var":6,"TEXT":7,"SPACE":8,"VARIABLE":9,"DATE":10,"+":11,"-":12,"*":13,"/":14,"^":15,"(":16,")":17,"ITERATOR":18,"NOW":19,"NUMBER":20,"date":21,"s":22,"e":23,"START":24,"END":25,"braces":26,"numbers":27,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",7:"TEXT",8:"SPACE",9:"VARIABLE",10:"DATE",11:"+",12:"-",13:"*",14:"/",15:"^",16:"(",17:")",18:"ITERATOR",19:"NOW",20:"NUMBER",24:"START",25:"END"},
productions_: [0,[3,2],[3,1],[4,1],[4,1],[4,1],[4,1],[4,1],[4,1],[4,1],[4,1],[4,1],[4,1],[4,1],[4,1],[4,1],[4,1],[4,1],[4,2],[4,2],[4,2],[4,2],[4,2],[4,2],[4,2],[4,2],[4,2],[4,2],[4,2],[4,2],[4,2],[4,2],[4,2],[21,1],[21,4],[21,4],[21,1],[21,4],[21,4],[6,3],[6,3],[6,3],[23,3],[23,3],[23,3],[23,3],[23,3],[23,2],[23,1],[23,1],[27,2],[27,2],[27,2],[27,2],[27,3],[27,3],[27,1],[27,1],[26,4],[26,4],[26,5],[26,3],[22,1],[22,0]],
performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

var $0 = $$.length - 1;
switch (yystate) {
case 1:return $$[$0-1];
break;
case 2:return $$[$0];
break;
case 3:this.$ = $$[$0];
break;
case 4:this.$ = $$[$0];
break;
case 5:this.$ = $$[$0];
break;
case 6:this.$ = $$[$0];
break;
case 7:this.$ = $$[$0];
break;
case 8:this.$ = $$[$0];
break;
case 9:this.$ = $$[$0];
break;
case 10:this.$ = $$[$0];
break;
case 11:this.$ = $$[$0];
break;
case 12:this.$ = $$[$0];
break;
case 13:this.$ = $$[$0];
break;
case 14:this.$ = $$[$0];
break;
case 15:this.$ = $$[$0];
break;
case 16:this.$ = $$[$0];
break;
case 17:this.$ = $$[$0];
break;
case 18:this.$ = $$[$0-1] + $$[$0];
break;
case 19:this.$ = $$[$0-1] + $$[$0];
break;
case 20:this.$ = $$[$0-1] + $$[$0];
break;
case 21:this.$ = $$[$0-1] + $$[$0];
break;
case 22:this.$ = $$[$0-1] + $$[$0];
break;
case 23:this.$ = $$[$0-1] + $$[$0];
break;
case 24:this.$ = $$[$0-1] + $$[$0];
break;
case 25:this.$ = $$[$0-1] + $$[$0];
break;
case 26:this.$ = $$[$0-1] + $$[$0];
break;
case 27:this.$ = $$[$0-1] + $$[$0];
break;
case 28:this.$ = $$[$0-1] + $$[$0];
break;
case 29:this.$ = $$[$0-1] + $$[$0];
break;
case 30:this.$ = $$[$0-1] + $$[$0];
break;
case 31:this.$ = $$[$0-1] + $$[$0];
break;
case 32:this.$ = $$[$0-1] + $$[$0];
break;
case 33:this.$ = "moment('" + $$[$0] + "', 'D.M.YYYY').format(format)";
break;
case 34:this.$ = "moment('" + $$[$0-3] + "', 'D.M.YYYY').add('d', " + $$[$0] + ").format(format)";
break;
case 35:this.$ = "moment('" + $$[$0-3] + "', 'D.M.YYYY').subtract('d', " + $$[$0] + ").format(format)";
break;
case 36:this.$ = "moment().format(format)";
break;
case 37:this.$ = "moment().add('d', " + $$[$0] + ").format(format)";
break;
case 38:this.$ = "moment().subtract('d', " + $$[$0] + ").format(format)";
break;
case 39:this.$ = $$[$0-2] + $$[$0-1] + $$[$0];
break;
case 40:this.$ = $$[$0-2] + $$[$0-1] + $$[$0];
break;
case 41:this.$ = $$[$0-2] + $$[$0-1] + $$[$0];
break;
case 42:this.$ = $$[$0-2] + "+" + $$[$0];
break;
case 43:this.$ = $$[$0-2] + "-" + $$[$0];
break;
case 44:this.$ = $$[$0-2] + "*" + $$[$0];
break;
case 45:this.$ = $$[$0-2] + "/" + $$[$0];
break;
case 46:this.$ = "Math.pow(" + $$[$0-2] + "," + $$[$0] + ")";
break;
case 47:this.$ = "-" + $$[$0] + $$[$01];
break;
case 48:this.$ = $$[$0];
break;
case 49:this.$ = $$[$0];
break;
case 50:this.$ = $$[$0-1] + $$[$0];
break;
case 51:this.$ = $$[$0-1] + $$[$0];
break;
case 52:this.$ = $$[$0-1] + $$[$0];
break;
case 53:this.$ = $$[$0-1] + $$[$0];
break;
case 54:this.$ = $$[$0-2] + $$[$0-1] + $$[$0];
break;
case 55:this.$ = $$[$0-2] + $$[$0-1] + $$[$0];
break;
case 56:this.$ = $$[$0];
break;
case 57:this.$ = $$[$0];
break;
case 58:this.$ = $$[$0-3] + $$[$0-2] + $$[$0-1] + $$[$0];
break;
case 59:this.$ = $$[$0-3] + $$[$0-2] + $$[$0-1] + $$[$0];
break;
case 60:this.$ = $$[$0-4] + $$[$0-3] + $$[$0-2] + $$[$0-1] + $$[$0];
break;
case 61:this.$ = $$[$0-2] + $$[$0-1] + $$[$0];
break;
case 62:this.$ = $$[$0];
break;
case 63:this.$ = $$[$0];
break;
}
},
table: [{3:1,4:2,5:[1,3],6:4,7:[1,5],8:[1,6],9:[1,7],10:[1,8],11:[1,9],12:[1,10],13:[1,11],14:[1,12],15:[1,13],16:[1,14],17:[1,15],18:[1,16],19:[1,17],20:[1,18],24:[1,19]},{1:[3]},{5:[1,20]},{1:[2,2]},{4:21,5:[2,3],6:4,7:[1,5],8:[1,6],9:[1,7],10:[1,8],11:[1,9],12:[1,10],13:[1,11],14:[1,12],15:[1,13],16:[1,14],17:[1,15],18:[1,16],19:[1,17],20:[1,18],24:[1,19]},{4:22,5:[2,4],6:4,7:[1,5],8:[1,6],9:[1,7],10:[1,8],11:[1,9],12:[1,10],13:[1,11],14:[1,12],15:[1,13],16:[1,14],17:[1,15],18:[1,16],19:[1,17],20:[1,18],24:[1,19]},{4:23,5:[2,5],6:4,7:[1,5],8:[1,6],9:[1,7],10:[1,8],11:[1,9],12:[1,10],13:[1,11],14:[1,12],15:[1,13],16:[1,14],17:[1,15],18:[1,16],19:[1,17],20:[1,18],24:[1,19]},{4:24,5:[2,6],6:4,7:[1,5],8:[1,6],9:[1,7],10:[1,8],11:[1,9],12:[1,10],13:[1,11],14:[1,12],15:[1,13],16:[1,14],17:[1,15],18:[1,16],19:[1,17],20:[1,18],24:[1,19]},{4:25,5:[2,7],6:4,7:[1,5],8:[1,6],9:[1,7],10:[1,8],11:[1,9],12:[1,10],13:[1,11],14:[1,12],15:[1,13],16:[1,14],17:[1,15],18:[1,16],19:[1,17],20:[1,18],24:[1,19]},{4:26,5:[2,8],6:4,7:[1,5],8:[1,6],9:[1,7],10:[1,8],11:[1,9],12:[1,10],13:[1,11],14:[1,12],15:[1,13],16:[1,14],17:[1,15],18:[1,16],19:[1,17],20:[1,18],24:[1,19]},{4:27,5:[2,9],6:4,7:[1,5],8:[1,6],9:[1,7],10:[1,8],11:[1,9],12:[1,10],13:[1,11],14:[1,12],15:[1,13],16:[1,14],17:[1,15],18:[1,16],19:[1,17],20:[1,18],24:[1,19]},{4:28,5:[2,10],6:4,7:[1,5],8:[1,6],9:[1,7],10:[1,8],11:[1,9],12:[1,10],13:[1,11],14:[1,12],15:[1,13],16:[1,14],17:[1,15],18:[1,16],19:[1,17],20:[1,18],24:[1,19]},{4:29,5:[2,11],6:4,7:[1,5],8:[1,6],9:[1,7],10:[1,8],11:[1,9],12:[1,10],13:[1,11],14:[1,12],15:[1,13],16:[1,14],17:[1,15],18:[1,16],19:[1,17],20:[1,18],24:[1,19]},{4:30,5:[2,12],6:4,7:[1,5],8:[1,6],9:[1,7],10:[1,8],11:[1,9],12:[1,10],13:[1,11],14:[1,12],15:[1,13],16:[1,14],17:[1,15],18:[1,16],19:[1,17],20:[1,18],24:[1,19]},{4:31,5:[2,13],6:4,7:[1,5],8:[1,6],9:[1,7],10:[1,8],11:[1,9],12:[1,10],13:[1,11],14:[1,12],15:[1,13],16:[1,14],17:[1,15],18:[1,16],19:[1,17],20:[1,18],24:[1,19]},{4:32,5:[2,14],6:4,7:[1,5],8:[1,6],9:[1,7],10:[1,8],11:[1,9],12:[1,10],13:[1,11],14:[1,12],15:[1,13],16:[1,14],17:[1,15],18:[1,16],19:[1,17],20:[1,18],24:[1,19]},{4:33,5:[2,15],6:4,7:[1,5],8:[1,6],9:[1,7],10:[1,8],11:[1,9],12:[1,10],13:[1,11],14:[1,12],15:[1,13],16:[1,14],17:[1,15],18:[1,16],19:[1,17],20:[1,18],24:[1,19]},{4:34,5:[2,16],6:4,7:[1,5],8:[1,6],9:[1,7],10:[1,8],11:[1,9],12:[1,10],13:[1,11],14:[1,12],15:[1,13],16:[1,14],17:[1,15],18:[1,16],19:[1,17],20:[1,18],24:[1,19]},{4:35,5:[2,17],6:4,7:[1,5],8:[1,6],9:[1,7],10:[1,8],11:[1,9],12:[1,10],13:[1,11],14:[1,12],15:[1,13],16:[1,14],17:[1,15],18:[1,16],19:[1,17],20:[1,18],24:[1,19]},{8:[1,45],9:[1,38],10:[1,42],12:[1,39],16:[1,44],18:[1,47],19:[1,43],20:[1,46],21:37,23:36,26:40,27:41},{1:[2,1]},{5:[2,18]},{5:[2,19]},{5:[2,20]},{5:[2,21]},{5:[2,22]},{5:[2,23]},{5:[2,24]},{5:[2,25]},{5:[2,26]},{5:[2,27]},{5:[2,28]},{5:[2,29]},{5:[2,30]},{5:[2,31]},{5:[2,32]},{11:[1,49],12:[1,50],13:[1,51],14:[1,52],15:[1,53],25:[1,48]},{25:[1,54]},{25:[1,55]},{8:[1,45],12:[1,39],16:[1,44],18:[1,47],20:[1,46],23:56,26:40,27:41},{11:[2,48],12:[2,48],13:[2,48],14:[2,48],15:[2,48],17:[2,48],25:[2,48]},{11:[2,49],12:[2,49],13:[2,49],14:[2,49],15:[2,49],17:[2,49],25:[2,49]},{8:[1,58],11:[2,63],12:[2,63],22:57,25:[2,33]},{8:[1,58],11:[2,63],12:[2,63],22:59,25:[2,36]},{8:[1,45],12:[1,39],16:[1,44],18:[1,47],20:[1,46],23:60,26:40,27:41},{16:[1,61],18:[1,63],20:[1,62]},{8:[1,64],11:[2,56],12:[2,56],13:[2,56],14:[2,56],15:[2,56],17:[2,56],25:[2,56]},{8:[1,65],11:[2,57],12:[2,57],13:[2,57],14:[2,57],15:[2,57],17:[2,57],25:[2,57]},{5:[2,39],7:[2,39],8:[2,39],9:[2,39],10:[2,39],11:[2,39],12:[2,39],13:[2,39],14:[2,39],15:[2,39],16:[2,39],17:[2,39],18:[2,39],19:[2,39],20:[2,39],24:[2,39]},{8:[1,45],12:[1,39],16:[1,44],18:[1,47],20:[1,46],23:66,26:40,27:41},{8:[1,45],12:[1,39],16:[1,44],18:[1,47],20:[1,46],23:67,26:40,27:41},{8:[1,45],12:[1,39],16:[1,44],18:[1,47],20:[1,46],23:68,26:40,27:41},{8:[1,45],12:[1,39],16:[1,44],18:[1,47],20:[1,46],23:69,26:40,27:41},{8:[1,45],12:[1,39],16:[1,44],18:[1,47],20:[1,46],23:70,26:40,27:41},{5:[2,40],7:[2,40],8:[2,40],9:[2,40],10:[2,40],11:[2,40],12:[2,40],13:[2,40],14:[2,40],15:[2,40],16:[2,40],17:[2,40],18:[2,40],19:[2,40],20:[2,40],24:[2,40]},{5:[2,41],7:[2,41],8:[2,41],9:[2,41],10:[2,41],11:[2,41],12:[2,41],13:[2,41],14:[2,41],15:[2,41],16:[2,41],17:[2,41],18:[2,41],19:[2,41],20:[2,41],24:[2,41]},{11:[2,47],12:[2,47],13:[1,51],14:[1,52],15:[1,53],17:[2,47],25:[2,47]},{11:[1,71],12:[1,72]},{11:[2,62],12:[2,62]},{11:[1,73],12:[1,74]},{11:[1,49],12:[1,50],13:[1,51],14:[1,52],15:[1,53],17:[1,75]},{8:[1,45],12:[1,39],16:[1,44],18:[1,47],20:[1,46],23:76,26:40,27:41},{8:[1,77],11:[2,52],12:[2,52],13:[2,52],14:[2,52],15:[2,52],17:[2,52],25:[2,52]},{8:[1,78],11:[2,53],12:[2,53],13:[2,53],14:[2,53],15:[2,53],17:[2,53],25:[2,53]},{11:[2,50],12:[2,50],13:[2,50],14:[2,50],15:[2,50],17:[2,50],25:[2,50]},{11:[2,51],12:[2,51],13:[2,51],14:[2,51],15:[2,51],17:[2,51],25:[2,51]},{11:[2,42],12:[2,42],13:[1,51],14:[1,52],15:[1,53],17:[2,42],25:[2,42]},{11:[2,43],12:[2,43],13:[1,51],14:[1,52],15:[1,53],17:[2,43],25:[2,43]},{11:[2,44],12:[2,44],13:[2,44],14:[2,44],15:[1,53],17:[2,44],25:[2,44]},{11:[2,45],12:[2,45],13:[2,45],14:[2,45],15:[1,53],17:[2,45],25:[2,45]},{11:[2,46],12:[2,46],13:[2,46],14:[2,46],15:[2,46],17:[2,46],25:[2,46]},{8:[1,45],12:[1,39],16:[1,44],18:[1,47],20:[1,46],23:79,26:40,27:41},{8:[1,45],12:[1,39],16:[1,44],18:[1,47],20:[1,46],23:80,26:40,27:41},{8:[1,45],12:[1,39],16:[1,44],18:[1,47],20:[1,46],23:81,26:40,27:41},{8:[1,45],12:[1,39],16:[1,44],18:[1,47],20:[1,46],23:82,26:40,27:41},{8:[1,83],11:[2,61],12:[2,61],13:[2,61],14:[2,61],15:[2,61],17:[2,61],25:[2,61]},{11:[1,49],12:[1,50],13:[1,51],14:[1,52],15:[1,53],17:[1,84]},{11:[2,54],12:[2,54],13:[2,54],14:[2,54],15:[2,54],17:[2,54],25:[2,54]},{11:[2,55],12:[2,55],13:[2,55],14:[2,55],15:[2,55],17:[2,55],25:[2,55]},{11:[1,49],12:[1,50],13:[1,51],14:[1,52],15:[1,53],25:[2,34]},{11:[1,49],12:[1,50],13:[1,51],14:[1,52],15:[1,53],25:[2,35]},{11:[1,49],12:[1,50],13:[1,51],14:[1,52],15:[1,53],25:[2,37]},{11:[1,49],12:[1,50],13:[1,51],14:[1,52],15:[1,53],25:[2,38]},{11:[2,58],12:[2,58],13:[2,58],14:[2,58],15:[2,58],17:[2,58],25:[2,58]},{8:[1,85],11:[2,59],12:[2,59],13:[2,59],14:[2,59],15:[2,59],17:[2,59],25:[2,59]},{11:[2,60],12:[2,60],13:[2,60],14:[2,60],15:[2,60],17:[2,60],25:[2,60]}],
defaultActions: {3:[2,2],20:[2,1],21:[2,18],22:[2,19],23:[2,20],24:[2,21],25:[2,22],26:[2,23],27:[2,24],28:[2,25],29:[2,26],30:[2,27],31:[2,28],32:[2,29],33:[2,30],34:[2,31],35:[2,32]},
parseError: function parseError(str, hash) {
    throw new Error(str);
},
parse: function parse(input) {
    var self = this,
        stack = [0],
        vstack = [null], // semantic value stack
        lstack = [], // location stack
        table = this.table,
        yytext = '',
        yylineno = 0,
        yyleng = 0,
        recovering = 0,
        TERROR = 2,
        EOF = 1;

    //this.reductionCount = this.shiftCount = 0;

    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    if (typeof this.lexer.yylloc == 'undefined')
        this.lexer.yylloc = {};
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);

    if (typeof this.yy.parseError === 'function')
        this.parseError = this.yy.parseError;

    function popStack (n) {
        stack.length = stack.length - 2*n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }

    function lex() {
        var token;
        token = self.lexer.lex() || 1; // $end = 1
        // if token isn't its numeric value, convert
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }

    var symbol, preErrorSymbol, state, action, a, r, yyval={},p,len,newState, expected;
    while (true) {
        // retreive state number from top of stack
        state = stack[stack.length-1];

        // use default actions if available
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol == null)
                symbol = lex();
            // read action for current state and first input
            action = table[state] && table[state][symbol];
        }

        // handle parse error
        _handle_error:
        if (typeof action === 'undefined' || !action.length || !action[0]) {

            if (!recovering) {
                // Report error
                expected = [];
                for (p in table[state]) if (this.terminals_[p] && p > 2) {
                    expected.push("'"+this.terminals_[p]+"'");
                }
                var errStr = '';
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line '+(yylineno+1)+":\n"+this.lexer.showPosition()+"\nExpecting "+expected.join(', ') + ", got '" + this.terminals_[symbol]+ "'";
                } else {
                    errStr = 'Parse error on line '+(yylineno+1)+": Unexpected " +
                                  (symbol == 1 /*EOF*/ ? "end of input" :
                                              ("'"+(this.terminals_[symbol] || symbol)+"'"));
                }
                this.parseError(errStr,
                    {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
            }

            // just recovered from another error
            if (recovering == 3) {
                if (symbol == EOF) {
                    throw new Error(errStr || 'Parsing halted.');
                }

                // discard current lookahead and grab another
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                symbol = lex();
            }

            // try to recover from error
            while (1) {
                // check for error recovery rule in this state
                if ((TERROR.toString()) in table[state]) {
                    break;
                }
                if (state == 0) {
                    throw new Error(errStr || 'Parsing halted.');
                }
                popStack(1);
                state = stack[stack.length-1];
            }

            preErrorSymbol = symbol; // save the lookahead token
            symbol = TERROR;         // insert generic error symbol as new lookahead
            state = stack[stack.length-1];
            action = table[state] && table[state][TERROR];
            recovering = 3; // allow 3 real symbols to be shifted before reporting a new error
        }

        // this shouldn't happen, unless resolve defaults are off
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: '+state+', token: '+symbol);
        }

        switch (action[0]) {

            case 1: // shift
                //this.shiftCount++;

                stack.push(symbol);
                vstack.push(this.lexer.yytext);
                lstack.push(this.lexer.yylloc);
                stack.push(action[1]); // push state
                symbol = null;
                if (!preErrorSymbol) { // normal execution/no error
                    yyleng = this.lexer.yyleng;
                    yytext = this.lexer.yytext;
                    yylineno = this.lexer.yylineno;
                    yyloc = this.lexer.yylloc;
                    if (recovering > 0)
                        recovering--;
                } else { // error just occurred, resume old lookahead f/ before error
                    symbol = preErrorSymbol;
                    preErrorSymbol = null;
                }
                break;

            case 2: // reduce
                //this.reductionCount++;

                len = this.productions_[action[1]][1];

                // perform semantic action
                yyval.$ = vstack[vstack.length-len]; // default to $$ = $1
                // default location, uses first token for firsts, last for lasts
                yyval._$ = {
                    first_line: lstack[lstack.length-(len||1)].first_line,
                    last_line: lstack[lstack.length-1].last_line,
                    first_column: lstack[lstack.length-(len||1)].first_column,
                    last_column: lstack[lstack.length-1].last_column
                };
                r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);

                if (typeof r !== 'undefined') {
                    return r;
                }

                // pop off stack
                if (len) {
                    stack = stack.slice(0,-1*len*2);
                    vstack = vstack.slice(0, -1*len);
                    lstack = lstack.slice(0, -1*len);
                }

                stack.push(this.productions_[action[1]][0]);    // push nonterminal (reduce)
                vstack.push(yyval.$);
                lstack.push(yyval._$);
                // goto new state = table[STATE][NONTERMINAL]
                newState = table[stack[stack.length-2]][stack[stack.length-1]];
                stack.push(newState);
                break;

            case 3: // accept
                return true;
        }

    }

    return true;
}};
undefined/* Jison generated lexer */
var lexer = (function(){
var lexer = ({EOF:1,
parseError:function parseError(str, hash) {
        if (this.yy.parseError) {
            this.yy.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },
setInput:function (input) {
        this._input = input;
        this._more = this._less = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {first_line:1,first_column:0,last_line:1,last_column:0};
        return this;
    },
input:function () {
        var ch = this._input[0];
        this.yytext+=ch;
        this.yyleng++;
        this.match+=ch;
        this.matched+=ch;
        var lines = ch.match(/\n/);
        if (lines) this.yylineno++;
        this._input = this._input.slice(1);
        return ch;
    },
unput:function (ch) {
        this._input = ch + this._input;
        return this;
    },
more:function () {
        this._more = true;
        return this;
    },
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20)+(next.length > 20 ? '...':'')).replace(/\n/g, "");
    },
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c+"^";
    },
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) this.done = true;

        var token,
            match,
            tempMatch,
            index,
            col,
            lines;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i=0;i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (!this.options.flex) break;
            }
        }
        if (match) {
            lines = match[0].match(/\n.*/g);
            if (lines) this.yylineno += lines.length;
            this.yylloc = {first_line: this.yylloc.last_line,
                           last_line: this.yylineno+1,
                           first_column: this.yylloc.last_column,
                           last_column: lines ? lines[lines.length-1].length-1 : this.yylloc.last_column + match[0].length}
            this.yytext += match[0];
            this.match += match[0];
            this.yyleng = this.yytext.length;
            this._more = false;
            this._input = this._input.slice(match[0].length);
            this.matched += match[0];
            token = this.performAction.call(this, this.yy, this, rules[index],this.conditionStack[this.conditionStack.length-1]);
            if (token) return token;
            else return;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            this.parseError('Lexical error on line '+(this.yylineno+1)+'. Unrecognized text.\n'+this.showPosition(), 
                    {text: "", token: null, line: this.yylineno});
        }
    },
lex:function lex() {
        var r = this.next();
        if (typeof r !== 'undefined') {
            return r;
        } else {
            return this.lex();
        }
    },
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },
popState:function popState() {
        return this.conditionStack.pop();
    },
_currentRules:function _currentRules() {
        return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules;
    },
topState:function () {
        return this.conditionStack[this.conditionStack.length-2];
    },
pushState:function begin(condition) {
        this.begin(condition);
    }});
lexer.options = {};
lexer.performAction = function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {

var YYSTATE=YY_START
switch($avoiding_name_collisions) {
case 0:return 8;
break;
case 1:return 19;
break;
case 2:return 24;
break;
case 3:return 25;
break;
case 4:return 10;
break;
case 5:return 20;
break;
case 6:return 18;
break;
case 7:return 9;
break;
case 8:return 13;
break;
case 9:return 14;
break;
case 10:return 12;
break;
case 11:return 11;
break;
case 12:return 15;
break;
case 13:return 16;
break;
case 14:return 17;
break;
case 15:return 5;
break;
case 16:return 7;
break;
}
};
lexer.rules = [/^\s+/,/^now/,/^#{/,/^}/,/^[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{4}/,/^[0-9]+(?:\.[0-9]+)?\b/,/^i/,/^[A-Za-z_]+[A-Za-z0-9_]*/,/^\*/,/^\//,/^-/,/^\+/,/^\^/,/^\(/,/^\)/,/^$/,/^[A-Za-z0-9_äüöÄÜÖß\!"§$%&/()=?`,;.:-^°/*-+{}]*/];
lexer.conditions = {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],"inclusive":true}};
return lexer;})()
parser.lexer = lexer;
return parser;
})();
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); }
exports.main = function commonjsMain(args) {
    if (!args[1])
        throw new Error('Usage: '+args[0]+' FILE');
    if (typeof process !== 'undefined') {
        var source = require('fs').readFileSync(require('path').join(process.cwd(), args[1]), "utf8");
    } else {
        var cwd = require("file").path(require("file").cwd());
        var source = cwd.join(args[1]).read({charset: "utf-8"});
    }
    return exports.parser.parse(source);
}
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(typeof process !== 'undefined' ? process.argv.slice(1) : require("system").args);
}
}