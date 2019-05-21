#include "Parser.h"
#include "Object.h"


using namespace std;

int main() {

	ifstream ifs;
	string file = "datoteka.txt";
	ifs.open(file);
	bool bResult = false;

	//if (ifs.is_open()) {
	//	Scanner sc(&ifs);
	//	while (!ifs.eof()) {
	//		//sc.nextToken();
	//		cout << sc.nextToken() << endl;
	//	}
	//}

	if (ifs.is_open()) {
		cout << "Input file is " << file << endl;
		Scanner sc(&ifs);

		//while (!ifs.eof()) {
		//	//sc.nextToken();
		//	cout << sc.nextToken() << endl;
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
	ifs.open(file);
	if (ifs.is_open()&&bResult) {
		cout << "Input file is " << file << endl;
		Scanner sc(&ifs);
		ObjectModel contractModel(sc);
		contractModel.generateModel();
		cout << contractModel.getContracts()->Izpis(0) << endl;
		/*sc.nextToken();
		if (test.Parse()) {
			cout << "Correct" << endl;
		}
		else {
			cout << "Incorrect" << endl;
		}*/

		ifs.close();
	}
	return(0);
}