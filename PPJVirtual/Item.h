#ifndef ITEM_H
#define ITEM_H


#include <iostream>
#include <list>
#include <iterator>
#include <string>

class Item{
private:
    string name;
    int ammount = 0;
public:
    Item(string n, int a):name(n),ammount(a){}
    
    string getName() const{
        return name;
    }
    
    int getAmmount() const{
        return ammount;
    }
    
    void addAmmount(int a){
        ammount+=a;
    }
    
    void substractAmmount(int a){
        ammount-=a;
    }
    
};


#endif 
