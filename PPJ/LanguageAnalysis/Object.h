#ifndef OBJECT_H
#define OBJECT_H

#include <fstream>
#include "Item.h"
#include "Scanner.h"



class ObjectModel
{
public:
	ObjectModel(Scanner temp);
	~ObjectModel();

	Item* getContracts(void);
	void generateModel(void);


private:
	//Scanner analizator;
	Item* contracts;
	Scanner analizator;

	Item* nextContract(void);
};

ObjectModel::ObjectModel(Scanner temp):analizator(temp)
{
	contracts = new Item("Contracts");
}

ObjectModel::~ObjectModel()
{
}

Item* ObjectModel::getContracts(void) {
	return(contracts);
}


Item* ObjectModel::nextContract(void) {
	Item* newItem = new Item("Reeee");
	Item* newItem2;
	if (analizator.currentToken().getToken() == Scanner::tContract) {
		analizator.nextToken();
		newItem = new Item(analizator.currentToken().getLexem());
		newItem2 = new Item("Parameters");
		newItem->addItem(newItem2);
		do {
			newItem2->addItem(nextContract());
		} while (analizator.currentToken().getLexem() != ")");
		newItem2 = new Item("Actions");
		newItem->addItem(newItem2);
		analizator.nextToken();
		newItem2->addItem(nextContract());
		newItem2->addItem(nextContract());

		analizator.nextToken();
	}else if (analizator.currentToken().getToken() == Scanner::tVariable|| analizator.currentToken().getToken() == Scanner::tCmp|| 
		analizator.currentToken().getToken() == Scanner::tInteger || analizator.currentToken().getToken() == Scanner::tGetRound) {
		newItem = new Item(analizator.currentToken().getLexem());
		string sTemp = analizator.currentToken().getLexem();
		analizator.nextToken();
		if (analizator.currentToken().getToken() == Scanner::tEquals) {
			newItem = new Item("Set "+sTemp);
			analizator.nextToken();
			newItem2 = new Item(analizator.currentToken().getLexem());
			newItem->addItem(newItem2);
			analizator.nextToken();
		}
	}
	else if (analizator.currentToken().getToken() == Scanner::tIf) {
		newItem = new Item(analizator.currentToken().getLexem());
		newItem2 = new Item("Conditions");
		Item* newItem3;
		newItem->addItem(newItem2);
		analizator.nextToken();
		do {
			newItem3 = new Item("Condition");
			newItem2->addItem(newItem3);
			do {
				newItem3->addItem(nextContract());
			} while (analizator.currentToken().getToken() != Scanner::tAnd && analizator.currentToken().getLexem() != ")");
		} while (analizator.currentToken().getToken() == Scanner::tAnd);
		newItem2 = new Item("Actions");
		newItem->addItem(newItem2);
		do {
			newItem2->addItem(nextContract());
			analizator.nextToken();
		}while(analizator.currentToken().getLexem()!="}");

		
		analizator.nextToken();
	}else if (analizator.currentToken().getToken() == Scanner::tItemCount || analizator.currentToken().getToken() == Scanner::tItemOperation) {
		newItem = new Item(analizator.currentToken().getLexem());
		newItem2 = new Item("Parameters");
		newItem->addItem(newItem2);
		analizator.nextToken();
		do{
			newItem2->addItem(nextContract());
		}while (analizator.currentToken().getLexem() != ")");
		analizator.nextToken();
	}else{
		//cout << analizator.currentToken().getLexem() << endl << endl;
		analizator.nextToken();
		newItem = nextContract();
	}
	
	return(newItem);
}


void ObjectModel::generateModel(void) {
	analizator.nextToken();
	do {
		//cout << "Zac: " << analizator.currentToken().getLexem() << endl;
		this->contracts->addItem(nextContract());
		//cout << "Konec: " << analizator.currentToken().getLexem() << endl;
	} while (analizator.currentToken().getToken()==Scanner::tContract);
}






#endif OBJECT_H