#include "Parser.h"
#include "Object.h"
#include <map> 


using namespace std;




list <Player*> playerList;
//map <string, Player*> playerMap;
map <string, int> variableMap;
map <string, int> constMap;

Player *findPlayer(string sName) {
	for (Player *player : playerList)
	{
		if (player->getName() == sName) {
			return(player);
		}
	}
	Player *player =new Player(sName);
	playerList.push_back(player);
	return(player);
}

int itemCount(TreeItem* itemH) {
	string sItem, sPlayer;
	int iIndex = 0, iRet=0;
	for (TreeItem *item : itemH->getChildren())
	{
		if (iIndex == 0) {
			sPlayer = item->getName();
		}
		else if (iIndex == 1) {
			sItem = item->getName();
		}
		iIndex++;
	}
	Currency curr = Currency(sItem, 0);
	Player* player = findPlayer(sPlayer);
	player->addCurrency(curr);
	cout << "Counting " << sItem << " for " << sPlayer << "\n";
	for (Currency curr2 : player->getCurrencies()) {
		if (curr2.getName() == sItem) {
			iRet= curr2.getAmmount();
		}
	}
	cout << iRet << "\n";
	return (iRet);
}

bool handleIf(TreeItem* itemH) {
	string sPrimerjava;
	int iValue1 = 0, iValue2 = 0, iIndex=0;
	for (TreeItem *item : itemH->getChildren())
	{
		if (item->getName() == "GETROUND" ) {
			iValue1 = constMap[item->getName()];
		}
		else if (item->getName() == "ITEMCOUNT") {
			iValue1 = itemCount(item->getChildren().front());
		}
		else if (iIndex == 1) {
			sPrimerjava = item->getName();
		}
		else {
			iValue2 = constMap[item->getName()];
		}
		iIndex++;
		cout << item->getName() << "\n";
	}
	cout << "Primerjava: " << iValue1 << " " << sPrimerjava << " " << iValue2 << "\n";
	cout << "\n";
	if (sPrimerjava == "==") {
		if (iValue1 == iValue2) {
			return(true);
		}
	}
	else if (sPrimerjava == ">=") {
		if (iValue1 >= iValue2) {
			return(true);
		}
	}else if (sPrimerjava == ">") {
		if (iValue1 > iValue2) {
			return(true);
		}
	}
	return(false);
}


void doStuff(TreeItem* itemD) {
	if (itemD->getName() == "Contracts") {
		//list <TreeItem*> ::iterator it;
		for (TreeItem *item :  itemD->getChildren())
		{
			doStuff(item);
			cout << "Result: " << variableMap["result"] << "\n___________________________________________\n";
		}
		
	}
	//obe te prestavi pol v spodnji else, to pač tako, da nemesto
	//da po uspesnem if skliče vse actione rekurzivno, poda funkciji samo actions list, pa gre ta čez
	else if (itemD->getName() == "ITEMSUB") {
		int iIndex = 0;
		string sPlayer, sItem, sAmount;
		TreeItem* parameters = itemD->getChildren().front();
		for (TreeItem *item : parameters->getChildren())
		{
			if (iIndex == 0) {
				sPlayer = item->getName();
			}
			else if (iIndex == 1) {
				sItem = item->getName();
			}
			else {
				sAmount = item->getName();
			}
			iIndex++;
		}
		cout << "Removing " << constMap[sAmount] << " of " << sItem << " from " << sPlayer << "\n";
		Currency curr = Currency(sItem, constMap[sAmount]);
		Player* player = findPlayer(sPlayer);
		player->substractCurrency(curr);
		int iRet = 0;
		for (Currency curr2 : player->getCurrencies()) {
			if (curr2.getName() == sItem) {
				iRet = curr2.getAmmount();
			}
		}
		cout << sItem << ": "<< iRet << "\n";
	}
	else if (itemD->getName() == "ITEMADD") {
		int iIndex = 0;
		string sPlayer, sItem, sAmount;
		TreeItem* parameters = itemD->getChildren().front();
		for (TreeItem *item : parameters->getChildren())
		{
			if (iIndex == 0) {
				sPlayer = item->getName();
			}
			else if (iIndex == 1) {
				sItem = item->getName();
			}
			else {
				sAmount = item->getName();
			}
			iIndex++;
		}
		cout << "Adding " << constMap[sAmount] << " of " << sItem << " to " << sPlayer << "\n";
		Currency curr = Currency(sItem, constMap[sAmount]);
		Player* player = findPlayer(sPlayer);
		player->addCurrency(curr);
		int iRet = 0;
		for (Currency curr2 : player->getCurrencies()) {
			if (curr2.getName() == sItem) {
				iRet = curr2.getAmmount();
			}
		}
		cout << sItem << ": " << iRet << "\n";
	}
	else if (itemD->getName() == "Set") {
		//cout << "REEEE" << endl;
		auto children2 = itemD->getChildren();
		list<TreeItem*>::iterator it = children2.begin();
		string sVar = (*it)->getName();
		advance(it, 1);
		//cout << (*it)->getName() << endl;
		sscanf_s((*it)->getName().c_str(), "%d", &variableMap[sVar]);
		//cout << variableMap[sVar] << "\n";
	}else {
		//TreeItem* params = itemD->getChildren().front();
		//cout << "Ayyy " << param->getName() << "\n";

		auto children = itemD->getChildren();
		string sVar;
		list<TreeItem*>::iterator it = children.begin();
		//cout << (*it)->getName() << "\n";
		advance(it, 1);
		TreeItem* actions = *(it);
		for (TreeItem *item : actions->getChildren())
		{

			if (item->getName() == "Set") {
				//cout << "REEEE" << endl;
				auto children2 = item->getChildren();
				list<TreeItem*>::iterator it = children2.begin();
				sVar = (*it)->getName();
				advance(it, 1);
				//cout << (*it)->getName() << endl;
				sscanf_s((*it)->getName().c_str(), "%d", &variableMap[sVar]);
				//cout << variableMap[sVar] << "\n";
			}if (item->getName() == "if") {
				bool bResult = true;
				auto childrenIf = item->getChildren();
				list<TreeItem*>::iterator itIf = childrenIf.begin();
				TreeItem* conditions = *(itIf);
				for (TreeItem *itemIf : conditions->getChildren())
				{
					if (!handleIf(itemIf)) {
						bResult = false;
					}
				}
				cout << "If result je: " << bResult << "\n";
				advance(itIf, 1);
				TreeItem* actionsIf = *(itIf);
				if (bResult) {
					for (TreeItem *itemIf2 : actionsIf->getChildren())
					{
						doStuff(itemIf2);
						//cout << itemIf2->getName() << "\n";
					}
				}
				//tukaj daj rekurzijo

				/*bResult = true;
				auto children2 = item->getChildren();
				list<TreeItem*>::iterator it = children2.begin();
				//bResult=pogoj((*it));
				advance(it, 1);
				//akcije((*it));*/

			}
			else{

			}

		}
		


		/*int iIndex = 0;
		string player1= "participant1", player2="";
		string item1 = "";
		string item2 = "";
		double amount1=20, amount2;
		
		for (TreeItem *item : params->getChildren())
		{
			switch (iIndex)
			{
			case 0:
				player1 = item->getName();
				break;
			case 1:
				item1 = item->getName();
				break;
			case 2:
				sscanf_s(item->getName().c_str(), "%lf", &amount1);
				break;
			case 3:
				player2 = item->getName();
				break;
			case 4:
				item2 = item->getName();
				break;
			case 5:
				sscanf_s(item->getName().c_str(), "%lf", &amount2);
				break;

			default:
				break;
			}
			iIndex++;
		}
		
		if (itemD->getName() == "START")
		{
			amount1 = 20;
			Player* objPlayer1 = findPlayer(player1);
			Item item = Item(item1, amount1);
			objPlayer1->addItem(item);

			
		}else if(itemD->getName() == "GIVE") {

		}
		else if (itemD->getName() == "TRADE") {

		}*/
		
	
	}
}


int main() {
    
    ifstream ifs;
    string file = "datoteka.txt";
    ifs.open(file);
    bool bResult = false;
    
    //if (ifs.is_open()) {
    //    Scanner sc(&ifs);
    //    while (!ifs.eof()) {
    //        //sc.nextToken();
    //        cout << sc.nextToken() << endl;
    //    }
    //}
    
    if (ifs.is_open()) {
        cout << "Input file is " << file << endl;
        Scanner sc(&ifs);
        
        //while (!ifs.eof()) {
        //    //sc.nextToken();
        //    cout << sc.nextToken() << endl;
        //}
        
        Parser test(sc);
        bResult = test.Parse();
        if (bResult) {
            cout << "Correct" << endl;
        }
        else {
            cout << "Incorrect" << endl;
        }
        
        ifs.close();
        
        //system("pause");
    }
	constMap["0"] = 0;
	constMap["GETROUND"] = 0;
	constMap["amount1"] = 1;
	constMap["amount10"] = 10;
	constMap["amount20"] = 20;
    ifs.open(file);
    if (ifs.is_open()&&bResult) {
        cout << "Input file is " << file << endl;
        Scanner sc(&ifs);
        ObjectModel contractModel(sc);
        contractModel.generateModel();
        cout << contractModel.getContracts()->Izpis(0) << endl;

		doStuff(contractModel.getContracts());

        ifs.close();
    }
    

	
	/*playerMap["participant1"]=new Player("participant1");
	Player* player1 = findPlayer("participant1");
	//playerMap2["participant1"] = *player1;
	Player player2 = *player1;
	playerMap["participant2"] = new Player("participant2");
	playerMap["shopkeep"] = new Player("shopkeep");
	playerMap["participant1"] = new Player("participant1");*/


    Item item=Item("item1",1);
    Currency currency = Currency("gold",20);
    list<Item> items = list<Item>();
    Player player = Player("participant1");
    player.addCurrency(currency);
    player.addItem(item);
    
    //cout<<player.getItems().begin()->getAmmount()<<endl;
    
    player.addItem(item);
    
    /*cout<<player.getItems().begin()->getAmmount()<<endl;
	variableMap["ayy"] = 0;
	cout << variableMap["ayy"] << "\n";
	variableMap["ayy"] = 2;
	cout << variableMap["ayy"] << "\n";*/

    return(0);
}
