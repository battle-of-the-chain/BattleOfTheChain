#pragma once
#include "Scanner.h"
class Parser
{


private:
	Scanner* scan;
public:
	Parser(Scanner& temp) {
		scan = &temp;
	}
	~Parser() {
	}

	bool Parse() {
		scan->nextToken();
		return S() && scan->currentToken().isEof();
		//return E() && EOF;
	}


	bool S() {
		if (scan->currentToken().getToken() == Scanner::tContract) {
			scan->nextToken();
			if (scan->currentToken().getToken() == Scanner::tFunction) {
				scan->nextToken();
				if (scan->currentToken().getLexem() == "(") {
					scan->nextToken();
					bool res1 = A();
					bool res2 = B();
					if (res1 && res2) {
						if (scan->currentToken().getLexem() == "{") {
							scan->nextToken();
							if (scan->currentToken().getToken() == Scanner::tVariable) {
								scan->nextToken();
								if (scan->currentToken().getToken() == Scanner::tEquals) {
									scan->nextToken();
									if (scan->currentToken().getToken() == Scanner::tInteger) {
										scan->nextToken();
										if (scan->currentToken().getToken() == Scanner::tSemicolon) {
											scan->nextToken();
											if (scan->currentToken().getToken() == Scanner::tIf) {
												scan->nextToken();
												if (scan->currentToken().getLexem() == "(") {
													scan->nextToken();
													bool res3 = E();
													if (res3) {
														return true;
														//else if (scan->currentToken().isEof()) {//TODO zaenkrat ne najdem lepsega nacina
														//	return true;
														//}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
		return false;
	}
	bool A() {
		if (scan->currentToken().getToken() == Scanner::tComma) {//TODO malo cudno ampak worx?
			scan->nextToken();
		}
		if (scan->currentToken().getToken() == Scanner::tVariable) {
			scan->nextToken();
			if (scan->currentToken().getToken() == Scanner::tComma) {
				scan->nextToken();
				if (scan->currentToken().getToken() == Scanner::tVariable) {
					scan->nextToken();
					if (scan->currentToken().getToken() == Scanner::tComma) {
						scan->nextToken();
						if (scan->currentToken().getToken() == Scanner::tVariable) {
							scan->nextToken();
							return true;
						}
					}
				}
			}
		}
		return false;
	}
	bool B() {
		bool res = A();
		if (res) {
			if (scan->currentToken().getLexem() == ")") {
				scan->nextToken();
				return true;
			}
		}
		else if (scan->currentToken().getLexem() == ")") {
			scan->nextToken();
			return true;
		}
		return false;
	}

	bool E() {
		bool res1 = F();
		if (res1) {
			if (scan->currentToken().getToken() == Scanner::tCmp) {
				scan->nextToken();
				bool res2 = G();
				bool res3 = H();
				if (res2 && res3) {
					//scan->nextToken();
					return true;
				}
			}
		}
		return false;
	}

	bool F() {
		if (scan->currentToken().getToken() == Scanner::tGetRound) {
			scan->nextToken();
			if (scan->currentToken().getLexem() == "(") {
				scan->nextToken();
				if (scan->currentToken().getLexem() == ")") {
					scan->nextToken();
					return true;
				}
			}
		}
		else if (scan->currentToken().getToken() == Scanner::tItemCount) {
			scan->nextToken();
			if (scan->currentToken().getLexem() == "(") {
				scan->nextToken();
				if (scan->currentToken().getToken() == Scanner::tVariable) {
					scan->nextToken();
					if (scan->currentToken().getToken() == Scanner::tComma) {
						scan->nextToken();
						if (scan->currentToken().getToken() == Scanner::tVariable) {
							scan->nextToken();
							if (scan->currentToken().getLexem() == ")") {
								scan->nextToken();
								return true;
							}
						}
					}
				}
			}
		}
		return false;
	}

	bool G() {
		if (scan->currentToken().getToken() == Scanner::tVariable) {
			scan->nextToken();
			return true;
		}
		if (scan->currentToken().getToken() == Scanner::tInteger) {
			scan->nextToken();
			return true;
		}
		return false;
	}

	bool H() {
		if (scan->currentToken().getToken() == Scanner::tAnd) {
			scan->nextToken();
			bool res = E();
			if (res) {
				//scan->nextToken();
				return true;
			}
		}
		else if (scan->currentToken().getLexem() == ")") {
			scan->nextToken();
			if (scan->currentToken().getLexem() == "{") {
				scan->nextToken();
				bool res1 = I();
				if (res1) {
					if (scan->currentToken().getLexem() == "}") {
						scan->nextToken();
						if (scan->currentToken().getLexem() == "}") {
							scan->nextToken();
							bool res2 = L();
							if (res2) {
								//scan->nextToken();
								return true;
							}
						}
					}
				}

			}
		}
		return false;
	}

	bool I() {
		if (scan->currentToken().getToken() == Scanner::tItemOperation) {
			scan->nextToken();
			bool res = J();
			if (res) {
				//scan->nextToken();
				return true;
			}
		}
		return false;
	}

	bool J() {
		if (scan->currentToken().getLexem() == "(") {
			scan->nextToken();
			bool res1 = A();
			if (res1) {
				if (scan->currentToken().getLexem() == ")") {
					scan->nextToken();
					if (scan->currentToken().getToken() == Scanner::tSemicolon) {
						scan->nextToken();
						bool res2 = K();
						if (res2) {
							//scan->nextToken();
							return true;
						}
					}
				}
			}
		}
		return false;
	}
	bool K() {
		bool res = I();
		if (res) {
			scan->nextToken();
			return true;
		}
		else if (scan->currentToken().getToken() == Scanner::tVariable) {
			scan->nextToken();
			if (scan->currentToken().getToken() == Scanner::tEquals) {
				scan->nextToken();
				if (scan->currentToken().getToken() == Scanner::tInteger) {
					scan->nextToken();
					if (scan->currentToken().getToken() == Scanner::tSemicolon) {
						scan->nextToken();
						return true;
					}
				}
			}
		}
		return false;
	}

	bool L() {
		bool res = S();
		if (res) {
			//scan->nextToken();
			return true;
		}
		return true;
	}





	//	S :: = contract #function(A B{ #var = #int; if (E
	//A :: = #var , #var , #var
	//B :: = A) | )
	//E :: = F #relationshipOperator G H
	//F :: = getround() | itemcount(#var, #var)
	//G :: = #int | #var
	//H :: = && E | ) { I } } L
	//I :: = itemadd J | itemsub J
	//J :: = (A); K
	//K :: = I | #var = #int;
	//	L :: = S | epsilon



//bool E() {
//	return T() && EE();
//}
//bool EE() {
//	if (scan->currentToken().getLexem() == "+") {
//		scan->nextToken();
//		return T() && EE();
//	}
//	else if (scan->currentToken().getLexem() == "-") {
//		scan->nextToken();
//		return T() && EE();
//	}
//	else {
//		return true;
//	}
//}
//bool T() {
//	return F() && TT();
//}

//bool TT() {
//	if (scan->currentToken().getLexem() == "*") {
//		scan->nextToken();
//		return F() && TT();
//	}
//	else if (scan->currentToken().getLexem() == "/") {
//		scan->nextToken();
//		return F() && TT();
//	}
//	else if (scan->currentToken().getLexem() == "^") {
//		scan->nextToken();
//		return F() && TT();
//	}
//	else if (scan->currentToken().getLexem() == "%") {
//		scan->nextToken();
//		return F() && TT();
//	}
//	else if (scan->currentToken().getLexem() == ":=") {
//		scan->nextToken();
//		return F() && TT();
//	}
//	else if (scan->currentToken().getLexem() == ";") {
//		scan->nextToken();
//		return F() && TT();
//	}
//	else if (scan->currentToken().getLexem() == "for" || scan->currentToken().getLexem() == "to") {
//		scan->nextToken();
//		return F() && TT();
//	}
//	else if (scan->currentToken().getLexem() == "CONSOLE") {
//		scan->nextToken();
//		return F() && TT();
//	}

//	else {
//		if (scan->currentToken().getToken() == scan->tInteger || scan->currentToken().getToken() == scan->tVariable) {
//			return F() && TT();
//		}
//		return true;
//	}
//}

//bool F() {
//	if (scan->currentToken().getLexem() == "(") {
//		scan->nextToken();
//		bool res = E();
//		if (res == true && scan->currentToken().getLexem() == ")") {
//			scan->nextToken();
//			return true;
//		}
//		else {
//			return false;
//		}
//	}
//	else if (scan->currentToken().getToken() == scan->tFloat || scan->currentToken().getToken() == scan->tInteger) {
//		scan->nextToken();
//		return true;
//	}
//	else if (scan->currentToken().getToken() == scan->tVariable) {
//		scan->nextToken();
//		return true;
//	}
//}



};

