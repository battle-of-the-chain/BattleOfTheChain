//
//  Currency.h
//  VirtualnoIzvajalnoOkolje
//
//  Created by Mai Praskalo on 22/05/2019.
//  Copyright © 2019 Mai Praskalo. All rights reserved.
//

#ifndef Currency_h
#define Currency_h

class Currency{
private:
    string name;
    int ammount = 0;
public:
    Currency(string n, int a):name(n),ammount(a){}
    Currency(string n):name(n){}
    
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

#endif /* Currency_h */
