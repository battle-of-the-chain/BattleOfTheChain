#ifndef SCANNER_H
#define SCANNER_H
#include "Token.h"

class Scanner
{
private:
	istream* input;
	Token lastToken;
	int row;
	int column;

	const static int maxState = 100;
	const static int startState = 0;
	const static int noEdge = -1;
	int automata[maxState + 1][256];
	int finite[maxState + 1];

	void initAutomata() {
		for (int i = 0; i <= maxState; i++) {
			for (int j = 0; j < 256; j++) {
				automata[i][j] = noEdge;
			}
		}

		for (int i = 0; i < maxState + 1; i++) {
			finite[i] = noEdge;
		}



#pragma region CurvedBrackets
		automata[0]['{'] = automata[0]['}'] = 1;
		finite[1] = tCurvedBrackets;
#pragma endregion 

#pragma region Variable
		for (int i = 'A'; i < 'Z'; i++) {
			automata[0][i] = 2;
		}
		for (int i = 'a'; i < 'z'; i++) {
			automata[0][i] = 2;
		}
		for (int i = 'a'; i <= 'z'; i++) {
			automata[2][i] = 2;
		}
		for (int i = 'A'; i <= 'Z'; i++) {
			automata[2][i] = 2;
		}
		for (int i = '0'; i <= '9'; i++) {
			automata[2][i] = 2;
		}
		finite[2] = tVariable;
#pragma endregion

#pragma region Integer

		for (int i = '0'; i < '9'; i++) {
			automata[0][i] = 3;
		}
		for (int i = '0'; i <= '9'; i++) {
			automata[3][i] = 3;
		}
		finite[3] = tInteger;

#pragma endregion

#pragma region normalBrackets
		automata[0]['('] = automata[0][')'] = 4;
		finite[4] = tBrackets;
#pragma endregion


#pragma region SemiColon
		automata[0][';'] = 5;
		finite[5] = tSemicolon;
#pragma endregion

#pragma region Compare or Assign
		//automata[0]['='] = automata[0]['<'] = automata[0]['>'] = 6;
		automata[0]['='] = 6;
		automata[0]['<'] = automata[0]['>'] = 7;
		automata[6]['='] = 13;
		automata[7]['='] = 8;

		finite[6] = tEquals;
		finite[13] = tCmp;
		finite[7] = tCmp;
		finite[8] = tCmp;//ker lahko je znak lahko pa ga ni

#pragma endregion

#pragma region Comma
		automata[0][','] = 9;
		finite[9] = tComma;
#pragma endregion


#pragma region And
		automata[0]['&'] = 10;
		automata[10]['&'] = 11;
		finite[11] = tAnd;
#pragma endregion

#pragma region Ignore
		automata[0][' '] = automata[0]['\n'] = automata[0]['\t'] = automata[0]['\r'] = 12;
		automata[12][' '] = automata[12]['\n'] = automata[12]['\t'] = automata[12]['\r'] = 12;
		finite[12] = tIgnore;
#pragma endregion




		//finite[13] = tVariable;



		//for (int i = '0'; i <= '9'; i++) {
		//	automata[0][i] = automata[1][i] = 1;
		//}
		//automata[0]['+'] = automata[0]['*'] = 2;
		//automata[0]['('] = automata[0][')'] = 3;
		//automata[0]['\n'] = automata[0][' '] = automata[0]['\t'] = 4;
		//automata[4]['\n'] = automata[4][' '] = automata[4]['\t'] = 4;


		finite[0] = tLexError;
	}

protected:
	int getNextState(int aState, int aChar) const {
		if (aChar == -1) return noEdge;
		return automata[aState][aChar];
	}

	bool isFiniteState(int aState) const {
		return finite[aState] != tLexError;
	}

	int getFiniteState(int aState) const {
		return finite[aState];
	}

private:
	int peek() {
		return input->peek();
	}

	int read() {
		int temp = input->get();
		column++;
		if (temp == '\n') {
			row++;
			column = 1;
		}
		return temp;
	}

	bool eof() {
		return peek() == -1;
	}

	Token nextTokenImp() {
		int currentState = startState;
		string lexem;
		int startColumn = column;
		int startRow = row;
		do {
			//ob trenutnem stanju in vhodnemu znaku pojdi v novo stanje
			auto peeked = peek();
			//if (peeked == 'f')
			//	int breakpoint = 0;
			int tempState = getNextState(currentState, peeked);
			if (tempState != noEdge) {//prehod v novo stanje je mozen
				currentState = tempState;
				//zdruzi prebrani znak v lexem
				lexem += (char)read();
			}
			else {//prehod ni mozen, ali je stanje koncno
				if (isFiniteState(currentState)) {
					//stanje je koncno in vrnemo osnovni lexikalni simbol
					Token token(lexem, startColumn, startRow, getFiniteState(currentState), eof());
					int tempToken = token.getToken();
					if (tempToken == tIgnore) {
						//presledke in nove vrstice prezremo
						return nextToken();
					}
					else {
						if (tempToken == tVariable) {
							if (lexem == "CONTRACT") {
								token.setToken(tContract);
							}
							else if (lexem == "if") {
								token.setToken(tIf);
							}
							else if (lexem == "ITEMADD") {
								token.setToken(tItemOperation);
							}
							else if (lexem == "ITEMSUB") {
								token.setToken(tItemOperation);
							}
							else if (lexem == "ITEMCOUNT") {
								token.setToken(tItemCount);
							}
							else if (lexem == "GETROUND") {
								token.setToken(tGetRound);
							}
							else if (lexem == "GIVE") {
								token.setToken(tFunction);
							}
							else if (lexem == "START") {
								token.setToken(tFunction);
							}
							else if (lexem == "TRADE") {
								token.setToken(tFunction);
							}
						}
						return token;
					}
				}
				else {
					//stanje ni koncno, vracamo leksikalno napako
					return Token("", startColumn, startRow, tLexError, eof());
				}
			}
		} while (true);
	}

public:
	const static int tLexError = -1;
	const static int tIgnore = 0; // whitespaces
	const static int tInteger = 1; //integers
	const static int tSemicolon = 2; // ; 
	const static int tComma = 3;// ,
	const static int tEquals = 4; // =
	const static int tBrackets = 5; // ()
	const static int tCurvedBrackets = 6; //{}
	const static int tCmp = 7; // == | > | >= | < | <=
	const static int tAnd = 8; //&&
	const static int tItemOperation = 9; //itemAdd | itemSub
	const static int tFunction = 10; //START, TRADE, GIVE
	const static int tItemCount = 11; //ITEMCOUNT
	const static int tGetRound = 12; //GETROUND
	const static int tContract = 13; //CONTRACT
	const static int tIf = 14;// if
	const static int tVariable = 15; //#variables





	//const static int tOperator = 2;
	//const static int tSeperator = 3;

	Scanner(istream * aInput) {
		row = 1;
		column = 1;
		initAutomata();
		input = aInput;
	}

	Token nextToken() {
		return lastToken = nextTokenImp();
	}

	Token currentToken() {
		return lastToken;
	}

};
#endif // SCANNER_H

