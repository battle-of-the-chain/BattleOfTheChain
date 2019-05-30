//
//  Player.h
//  VirtualnoIzvajalnoOkolje
//
//  Created by Mai Praskalo on 22/05/2019.
//  Copyright © 2019 Mai Praskalo. All rights reserved.
//

#ifndef Player_h
#define Player_h

#include <list>
#include "Item.h"
#include "Currency.h"
#include <algorithm>
#include <map>




class Player{
private:
    string name;
    list<Item> items;
    list<Currency> currencies;
    

public:
    Player(string n, list<Item> i, list<Currency> c): name(n),items(i),currencies(c){}
    Player(string n):name(n){}
	Player(const Player& p2) :name(p2.name), items(p2.items), currencies(p2.currencies) {}

	string getName(void) {
		return(this->name);
	}
    
    list<Item> getItems(){
        return items;
    }
    
    list<Currency> getCurrencies(){
        return currencies;
    }
    //Če item/currency uporabnik že ima, se mu poveča ammount, drugače se doda nov item/currency
    //find_if vrača iterator na last (list.end()), če ne najde ujemanja, ki je za elementi
    
    //dodaj valuto uporabniku
    void addCurrency(Currency currency){
        list<Currency>:: iterator it;
        it = find_if(begin(currencies), end(currencies),
                     [&] (Currency const& c) { return c.getName() == currency.getName(); });
        
        if(it != currencies.end()){
            it->addAmmount(currency.getAmmount());
        }
        else{
            currencies.insert(currencies.end(), currency);
        }
    }

    //odvzemi valuto uporabniku
    void substractCurrency(Currency currency){
        list<Currency>:: iterator it;
        it = find_if(begin(currencies), end(currencies),
                     [&] (Currency const& c) { return c.getName() == currency.getName(); });
        
        if(it == currencies.end() || it->getAmmount() == 0 || it->getAmmount()-currency.getAmmount() <0){
            cout<<"User either does not have this currency or does not have enough!";
        }
        else{
            it->substractAmmount(currency.getAmmount());
        }
    }
    
    //dodaj item uporabniku
    void addItem(Item item){
        list<Item>:: iterator it;
        it = find_if(begin(items), end(items),
                     [&] (Item const& i) { return i.getName() == item.getName(); });
        
        if(it != items.end()){
            it->addAmmount(item.getAmmount());
        }
        else{
            items.insert(items.end(), item);
        }
    }
    
    //odstrani item uporabniku
    void removeItem(Item item){
        list<Item>:: iterator it;
        it = find_if(begin(items), end(items),
                     [&] (Item const& i) { return i.getName() == item.getName(); });
        
        if(it == items.end() || it->getAmmount() == 0 || it->getAmmount()-item.getAmmount() <0){
            cout << "User does either not have this item or does not have enough!";
        }
        else{
            it->substractAmmount(item.getAmmount());
        }
    }
    
    
};



#endif /* Player_h */
