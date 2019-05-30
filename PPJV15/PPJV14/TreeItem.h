#ifndef TREEITEM_H
#define TREEITEM_H


#include <iostream>
#include <list>
#include <iterator>
#include <string>

using namespace std;

class TreeItem
{
public:
    TreeItem(string sName);
    ~TreeItem();
    
    string Izpis(int iIndent);
    string getName(void);
    void addItem(TreeItem* itItem);
	list <TreeItem*> getChildren(void);
    
private:
    string name;
    int ammount;
    list <TreeItem*> childlist;
};

TreeItem::TreeItem(string sName):name(sName){}

TreeItem::~TreeItem()
{
}


string TreeItem::Izpis(int iIndent) {
    string sIzpis = "";
    for (int iStevec1 = 0; iStevec1 < iIndent; iStevec1++)
    {
        sIzpis += "\t";
    }
    sIzpis += this->name + "\n";
    list <TreeItem*> ::iterator it;
    for (it = this->childlist.begin(); it != this->childlist.end(); ++it)
        sIzpis += (*it)->Izpis(iIndent+1);
    return(sIzpis);
}


void TreeItem::addItem(TreeItem* itItem) {
    this->childlist.push_back(itItem);
}

string TreeItem::getName(void) {
    return(this->name);
}

list <TreeItem*> TreeItem::getChildren(void) {
	return(this->childlist);
}

#endif
