#ifndef ITEM_H
#define ITEM_H


#include <iostream>
#include <list>
#include <iterator> 
#include <string>

using namespace std;

class Item
{
public:
	Item(string sName);
	~Item();

	string Izpis(int iIndent);
	string getName(void);
	void addItem(Item* itItem);

private:
	string name;
	list <Item*> childlist;
};

Item::Item(string sName):name(sName){}

Item::~Item()
{
}


string Item::Izpis(int iIndent) {
	string sIzpis = "";
	for (int iStevec1 = 0; iStevec1 < iIndent; iStevec1++)
	{
		sIzpis += "\t";
	}
	sIzpis += this->name + "\n";
	list <Item*> ::iterator it;
	for (it = this->childlist.begin(); it != this->childlist.end(); ++it)
		sIzpis += (*it)->Izpis(iIndent+1);
	return(sIzpis);
}


void Item::addItem(Item* itItem) {
	this->childlist.push_back(itItem);
}

string Item::getName(void) {
	return(this->name);
}

#endif ITEM_H