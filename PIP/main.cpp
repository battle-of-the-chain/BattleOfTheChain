#include <mpi.h>
#include <iostream>
#include <thread>
#include <vector>
#include <string>
#include <ctime>
#include <sstream>
#include <bitset>
#include "cryptopp/sha.h"
#include "cryptopp/filters.h"
#include "cryptopp/base64.h"


using namespace std;

class Block;
bool isMaster();
int getDifficulty(vector<Block> ch);
int getAdjustedDifficulty (Block latestBlock, vector<Block> ch);
unsigned int getCurrentTimeStamp();
void generateBlock(vector<Block> ch);
string calculateHash(int index, string previousHash, int timestamp, int difficulty, int nonce);
Block findBlock(int index, string previousHash, int timestamp, int difficulty);
bool hashMatchesDifficulty(string hash, int difficulty);


int world_size;
int world_rank;
int threads_here;


const int BLOCK_GENERATION_INTERVAL = 10;
const int DIFFICULTY_ADJUSTMENT_INTERVAL = 10;

vector<Block> chain;//chain


class Block{
	public:
		unsigned int index;
		string hash;
		string previousHash;
		unsigned int timestamp;
		int difficulty;
		int nonce;

		Block(int index, string hash, string previousHash, int timestamp, int difficulty, int nonce) {
			this->index = index;
			this->previousHash = previousHash;
			this->timestamp = timestamp;
			this->hash = hash;
			this->difficulty = difficulty;
			this->nonce = nonce;
		}
	
};




bool isMaster(){
    if(world_rank == 0){
        return true;
    }
    return false;
}

int getDifficulty(vector<Block> ch){
	Block latestBlock = ch.back();
	if (latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL == 0 && latestBlock.index != 0) {
        return getAdjustedDifficulty(latestBlock, ch);
    } 
	else {
        return latestBlock.difficulty;
    }
}

int getAdjustedDifficulty (Block latestBlock, vector<Block> ch){
    Block prevAdjustmentBlock = ch[ch.size() - DIFFICULTY_ADJUSTMENT_INTERVAL];
    int timeExpected = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
    int timeTaken = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
    if (timeTaken < timeExpected / 2) {
        return prevAdjustmentBlock.difficulty + 1;
    } else if (timeTaken > timeExpected * 2) {
        return prevAdjustmentBlock.difficulty - 1;
    } else {
        return prevAdjustmentBlock.difficulty;
    }
};

unsigned int getCurrentTimeStamp(){
	time_t timestamp = std::time(0); 
	return timestamp;//will it return?
}

void generateBlock(vector<Block> ch){
	if(!ch.empty()){
		Block previousBlock = ch.back();
		int difficulty = getDifficulty(ch);
		int nextIndex = previousBlock.index + 1;
		int nextTimestamp = getCurrentTimeStamp();
		Block newBlock = findBlock(nextIndex,previousBlock.hash, nextTimestamp,difficulty);
		chain.push_back(newBlock);
	}
	else{
		int ts = getCurrentTimeStamp();
		Block genesis(0, calculateHash(0,"",ts,0,0), "", ts, 0, 0);
		//cout << genesis.hash << endl;
		chain.push_back(genesis);
		
	}
}

std::string SHA256HashString(std::string aString){
    std::string digest;
    CryptoPP::SHA256 hash;

    CryptoPP::StringSource foo(aString, true,
    new CryptoPP::HashFilter(hash,
      new CryptoPP::Base64Encoder (
         new CryptoPP::StringSink(digest))));

    return digest;
}

string calculateHash(int index, string previousHash, int timestamp, int difficulty, int nonce){
	string input;
	stringstream ss;

	ss << index << previousHash << timestamp << difficulty << nonce;
	input = ss.str();
	return SHA256HashString(input);
}



Block findBlock(int index, string previousHash, int timestamp, int difficulty){
	int nonce = 0;
	string hash;
	while(true){
		hash = calculateHash(index, previousHash, timestamp, difficulty, nonce);
		//cout << hash << endl;
		
		//TODO
		if(hashMatchesDifficulty(hash,difficulty)){
			//(0, calculateHash(0,"",ts,0,0), "", ts, 0, 0)
			Block newblock(index,hash,previousHash,timestamp,difficulty,nonce);
			return newblock;
		}
		nonce++;
	}
	
}

bool hashMatchesDifficulty(string hash, int difficulty){
	stringstream ss;
	for (std::size_t i = 0; i < hash.size(); ++i){
		ss << bitset<8>(hash.c_str()[i]);
	}
	string binary = ss.str();
	//string zero = "0";
	for(int i = 0; i < difficulty; i++){
		if(binary.at(i) != '0'){
			return false;
		}
	}
	//cout << binary << endl;
	return true;
	
}

void lastBlockInfo(){
	if(chain.size() > 0){
		Block temp = chain.back();
		cout<<"Index: "<< temp.index << endl;
		cout<<"Hash: "<< temp.hash << endl;
		cout<<"Timestamp: "<< temp.timestamp << endl;
	}
	else{
		cout << "Chain is empty" <<endl;
	}
}



int main(int argc, char** argv){
	cout << "Paralel mining algorithm" <<endl;
	
    MPI_Init(NULL,NULL);
	threads_here = std::thread::hardware_concurrency();
    MPI_Comm_size(MPI_COMM_WORLD, &world_size);
    MPI_Comm_rank(MPI_COMM_WORLD, &world_rank);
    MPI_Status status;
	


    if(isMaster){
		bool exit = false;
		while(!exit){
			cout << "Enter command: " << endl;
			cout << ">> ";
			char input;
			cin>>input;
			cout << endl;
			
			switch(input){
				case 'm'://mine
					generateBlock(chain);
					cout << "block generated" << endl;
					break;
				case 'x'://exit
					exit = true;
					break;
				case 'c'://chain info
					cout << "Chain length: " << chain.size() << endl;
					break;
				case 'i':
					lastBlockInfo();
					break;
				default:
					cout<<"Invalid input"<<endl;
					break;
			}
			cout << endl;
		}

    }
    // else{
        // while(true){
            // int data;
            // mpi_recv(&data,1,mpi_int,0,mpi_any_tag,mpi_comm_world,&status);
			// //status.mpi_source   /// status.mpi_tag
			// int tag = status.mpi_tag;
			// switch(tag) {
				// case 0://exit 
					
					// break;
				// case 1://mining
					
					// break;
				// default:
					// // code block
					// break;
			// }
        // }
    // }




    MPI_Finalize();//@ the end

}