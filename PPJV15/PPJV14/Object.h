#ifndef OBJECT_H
#define OBJECT_H

#include <fstream>
#include "TreeItem.h"
#include "Scanner.h"
#include "Player.h"



class ObjectModel
{
public:
    ObjectModel(Scanner temp);
    ~ObjectModel();
    
    TreeItem* getContracts(void);
    void generateModel(void);
    
    
private:
    //Scanner analizator;
    TreeItem* contracts;
    Scanner analizator;
    
    TreeItem* nextContract(void);
};

ObjectModel::ObjectModel(Scanner temp):analizator(temp)
{
    contracts = new TreeItem("Contracts");
}

ObjectModel::~ObjectModel()
{
}

TreeItem* ObjectModel::getContracts(void) {
    return(contracts);
}


TreeItem* ObjectModel::nextContract(void) {
    TreeItem* newItem = new TreeItem("Reeee");
    TreeItem* newItem2;
    if (analizator.currentToken().getToken() == Scanner::tContract) {
        analizator.nextToken();
        newItem = new TreeItem(analizator.currentToken().getLexem());
        newItem2 = new TreeItem("Parameters");
        newItem->addItem(newItem2);
        do {
            newItem2->addItem(nextContract());
        } while (analizator.currentToken().getLexem() != ")");
        newItem2 = new TreeItem("Actions");
        newItem->addItem(newItem2);
        analizator.nextToken();
        newItem2->addItem(nextContract());
        newItem2->addItem(nextContract());
        
        analizator.nextToken();
    }else if (analizator.currentToken().getToken() == Scanner::tVariable|| analizator.currentToken().getToken() == Scanner::tCmp||
              analizator.currentToken().getToken() == Scanner::tInteger || analizator.currentToken().getToken() == Scanner::tGetRound) {
        newItem = new TreeItem(analizator.currentToken().getLexem());
        string sTemp = analizator.currentToken().getLexem();
        analizator.nextToken();
        if (analizator.currentToken().getToken() == Scanner::tEquals) {
            newItem = new TreeItem("Set");
            analizator.nextToken();
			newItem2 = new TreeItem(sTemp);
			newItem->addItem(newItem2);
            newItem2 = new TreeItem(analizator.currentToken().getLexem());
            newItem->addItem(newItem2);
            analizator.nextToken();
        }
    }
    else if (analizator.currentToken().getToken() == Scanner::tIf) {
        newItem = new TreeItem(analizator.currentToken().getLexem());
        newItem2 = new TreeItem("Conditions");
        TreeItem* newItem3;
        newItem->addItem(newItem2);
        analizator.nextToken();
        do {
            newItem3 = new TreeItem("Condition");
            newItem2->addItem(newItem3);
            do {
                newItem3->addItem(nextContract());
            } while (analizator.currentToken().getToken() != Scanner::tAnd && analizator.currentToken().getLexem() != ")");
        } while (analizator.currentToken().getToken() == Scanner::tAnd);
        newItem2 = new TreeItem("Actions");
        newItem->addItem(newItem2);
        do {
            newItem2->addItem(nextContract());
            analizator.nextToken();
        }while(analizator.currentToken().getLexem()!="}");
        
        
        analizator.nextToken();
    }else if (analizator.currentToken().getToken() == Scanner::tItemCount || analizator.currentToken().getToken() == Scanner::tItemOperation) {
        newItem = new TreeItem(analizator.currentToken().getLexem());
        newItem2 = new TreeItem("Parameters");
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






#endif 
