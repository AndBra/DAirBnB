import smartpy as sp

class bnb(sp.Contract):
    def __init__(self, contract, owner, visitor):
        self.init(contract = contract, owner = owner, visitor = visitor, price = sp.tez(0), start_date = "start_date", dep_date = "dep_date", nuki = ("00", False), my_method = "Contract_Initialisation", reputation = (owner, 0), deposit = sp.tez(0), fair = sp.tez(0), cp = 0, cn = 0, rn = "dirty",claim = False, balances = sp.big_map())

    @sp.entry_point
    def Contract_Call(self, params):
        sp.if (params.my_method == "cancellationOwner"):
            self.cancellationOwner(cp = params.cp)
        sp.if (params.my_method == "cancellationVisitor"):
            self.cancellationVisitor(cp = params.cp)
        sp.if (params.my_method == "Finish_ContractOwner"):
            self.Finish_ContractOwner(cp = params.cp, mark = params.mark)
        sp.if (params.my_method == "Finish_ContractVisitor"):
            self.Finish_ContractVisitor(cp = params.cp, mark = params.mark)
        sp.if (params.my_method == "Nuki_Invokation"):
            self.Nuki_Invokation(nuki = params.nuki)
        sp.if (params.my_method == "Contract_Initialisation"):
            self.Contract_Initialisation(price = params.price, start_date = params.start_date, dep_date = params.dep_date, nuki = params.nuki, deposit = params.deposit, fair = params.fair, owner = params.owner, visitor = params.visitor, contract = params.contract)
        sp.if (params.my_method == "SendDepositOwner"):
            self.SendDepositOwner(fair = params.fair)
        sp.if (params.my_method == "SendDepositVisitor"):
            self.SendDepositVisitor(deposit = params.deposit)
        sp.if (params.my_method == "SendPrice"):
            self.SendPrice(price = params.price)
        sp.if (params.my_method == "Agree"):
            self.Agree(claim = params.claim, cn = params.cn)
        sp.if (params.my_method == "RenewContract"):
            self.RenewContract(rn = params.rn)
            
            
    
    
    def cancellationOwner(self, cp):
        sp.if (cp == 1):
            self.data.balances[self.data.contract].balance -= self.data.fair+self.data.deposit+self.data.price
            self.data.balances[self.data.visitor].balance += self.data.fair+self.data.deposit+self.data.price
            
    def cancellationVisitor(self, cp):
        sp.if (cp == 1):
            self.data.balances[self.data.contract].balance -= self.data.fair+self.data.deposit+self.data.price
            self.data.balances[self.data.owner].balance += self.data.fair+self.data.deposit
            self.data.balances[self.data.visitor].balance += self.data.price
        sp.if (cp == 2):
            self.data.balances[self.data.contract].balance -= self.data.deposit + self.data.price + self.data.fair 
            self.data.balances[self.data.visitor].balance += self.data.deposit + self.data.price + self.data.fair
        sp.if (cp == 3):
            self.data.balances[self.data.contract].balance -= self.data.deposit + self.data.fair 
            self.data.balances[self.data.visitor].balance += self.data.deposit
            self.data.balances[self.data.owner].balance += self.data.fair
            
    
    
    def RenewContract(self, rn):
        sp.if (rn == "dirty"):
            self.data.balances[self.data.contract].balance -= self.data.price
            self.data.balances[self.data.owner].balance += self.data.price - self.data.fair
            self.data.balances[self.data.visitor].balance += self.data.fair
            self.data.price = self.data.price - self.data.fair 
    
    def Finish_ContractOwner(self, cp, mark):  
        sp.if (cp == 0):
            self.data.cp = cp
            self.data.balances[self.data.contract].balance -= self.data.fair
            self.data.balances[self.data.owner].balance += self.data.fair
            self.data.reputation = (self.data.visitor, mark)
            
            
    
    def Finish_ContractVisitor(self, cp, mark): 
        sp.if (cp == 0):
            self.data.balances[self.data.contract].balance -= self.data.deposit
            self.data.balances[self.data.visitor].balance += self.data.deposit
            self.data.reputation = (self.data.owner, mark)
            
            
    
    def Nuki_Invokation(self, nuki):
        self.data.nuki = nuki
        #sp.if (sp.now == sp.now.add_seconds(600)) & (params.claim == False): 
            #sp.if (params.cn == 1):
                #self.transfer(self.data.contract, self.data.owner, self.data.price)
            
            
    
    def Contract_Initialisation(self, price, start_date, dep_date, nuki, deposit, fair, owner, visitor, contract):
        self.data.price = price
        sp.verify(start_date != dep_date)
        self.data.start_date = start_date
        self.data.dep_date = dep_date
        self.data.nuki = nuki
        self.data.deposit = deposit
        self.data.fair = fair
        self.data.balances[owner] = sp.record(balance = sp.tez(100))
        self.data.balances[contract] = sp.record(balance = sp.tez(0))
        self.data.balances[visitor] = sp.record(balance = sp.tez(100))
        
        
    
    def SendDepositOwner(self, fair):
        sp.if (fair == self.data.fair):
            self.data.balances[self.data.owner].balance -= self.data.fair
            self.data.balances[self.data.contract].balance += self.data.fair
            
    
    def SendDepositVisitor(self, deposit):
        sp.if (deposit == self.data.deposit):
            self.data.balances[self.data.visitor].balance -= self.data.deposit
            self.data.balances[self.data.contract].balance += self.data.deposit
            
   
    def SendPrice(self, price):
        sp.if (price == self.data.price):
            self.data.balances[self.data.visitor].balance -= self.data.price
            self.data.balances[self.data.contract].balance += self.data.price
         

    
    def Agree(self, claim, cn):
        sp.if (claim == False) & (cn == 1):
            self.data.claim = claim
            self.data.balances[self.data.contract].balance -= self.data.price
            self.data.balances[self.data.owner].balance += self.data.price
            
            
            

@sp.add_test(name = "bnb")
def test():
   
    contract = sp.test_account("contract")
    owner   = sp.test_account("owner")
    visitor = sp.test_account("visitor")

    c1 = bnb(contract = contract.address,owner =  owner.address, visitor = visitor.address)
    scenario  = sp.test_scenario()
    scenario += c1
   

    scenario.h2("Accounts")
    scenario.show([contract, owner, visitor])
    
    scenario.h2("Contract_Initialisation")
    scenario += c1.Contract_Call(my_method = "Contract_Initialisation", price = sp.tez(30), fair = sp.tez(10), deposit = sp.tez(10), dep_date = "08", start_date = "01", nuki = ("0330", False), claim = False, cp = 0, cn = 1, rn = "dirty", mark = 10, owner = owner.address, visitor = visitor.address, contract = contract.address).run(sender = contract)
    
    scenario.h2("SendDepositOwner")
    scenario += c1.Contract_Call(my_method = "SendDepositOwner", price = sp.tez(30), fair = sp.tez(10), deposit = sp.tez(10), dep_date = "08", start_date = "01", nuki = ("0330", False), claim = False, cp = 0, cn = 1, rn = "dirty", mark = 10 , owner = owner.address, visitor = visitor.address, contract = contract.address).run(sender = contract)
    
    scenario.h2("SendDepositVisitor")
    scenario += c1.Contract_Call(my_method = "SendDepositVisitor", price = sp.tez(30), fair = sp.tez(10), deposit = sp.tez(10), dep_date = "08", start_date = "01", nuki = ("0330", False), claim = False, cp = 0, cn = 1, rn = "dirty", mark = 10, owner = owner.address, visitor = visitor.address, contract = contract.address).run(sender = contract)
    
    scenario.h2("SendPrice")
    scenario += c1.Contract_Call(my_method = "SendPrice", price = sp.tez(30), fair = sp.tez(10), deposit = sp.tez(10), dep_date = "08", start_date = "01", nuki = ("0330", False), claim = False, cp = 0, cn = 1, rn = "dirty", mark = 10, owner = owner.address, visitor = visitor.address, contract = contract.address).run(sender = contract)
    
    scenario.h2("Nuki_Invokation")
    scenario += c1.Contract_Call(my_method = "Nuki_Invokation", price = sp.tez(30), fair = sp.tez(10), deposit = sp.tez(10), dep_date = "08", start_date = "01", nuki = ("0330", False), claim = False, cp = 0, cn = 1, rn = "dirty", mark = 10, owner = owner.address, visitor = visitor.address, contract = contract.address).run(sender = contract)
    
    scenario.h2("Agree")
    scenario += c1.Contract_Call(my_method = "Agree", price = sp.tez(30), fair = sp.tez(10), deposit = sp.tez(10), dep_date = "08", start_date = "01", nuki = ("0330", False), claim = False, cp = 0, cn = 1, rn = "dirty", mark = 10, owner = owner.address, visitor = visitor.address, contract = contract.address).run(sender = contract)
    
    scenario.h2("Finish_ContractOwner")
    scenario += c1.Contract_Call(my_method = "Finish_ContractOwner", price = sp.tez(30), fair = sp.tez(10), deposit = sp.tez(10), dep_date = "08", start_date = "01", nuki = ("0330", False), claim = False, cp = 0, cn = 1, rn = "dirty", mark = 10, owner = owner.address, visitor = visitor.address, contract = contract.address).run(sender = contract)
    
    scenario.h2("Finish_ContractVisitor")
    scenario += c1.Contract_Call(my_method = "Finish_ContractVisitor", price = sp.tez(30), fair = sp.tez(10), deposit = sp.tez(10), dep_date = "08", start_date = "01", nuki = ("0330", False), claim = False, cp = 0, cn = 1, rn = "dirty", mark = 10, owner = owner.address, visitor = visitor.address, contract = contract.address).run(sender = contract)
    
    
    

    #scenario += c1.mint(address = owner.address, amount = sp.tez(100)).run(sender = contract)
    #scenario += c1.mint(address = visitor.address, amount = sp.tez(100)).run(sender = contract)
    #scenario.h2("h1")
   
    #scenario.h2("Contract Initialisation")
    #scenario += c1.Contract_Initialisation(price = sp.tez(20), start_date = "03", dep_date = "07", deposit = sp.tez(10), fair = sp.tez(10), nuki = ("0330", False)).run(sender = contract)
    
    #scenario.h2("Send Deposit visitor")
    #scenario += c1.SendDepositOwner(fair = sp.tez(10))
    #scenario.h2("Send Deposit owner")
    #scenario += c1.SendDepositVisitor(deposit = sp.tez(10))
    
    #scenario.h2("Send Price")
    #scenario += c1.SendPrice(price = sp.tez(20))
    
    #scenario.h2("Nuki Invokation")
    #scenario += c1.Nuki_Invokation(nuki = ("0330", True)).run(sender = visitor)
    
    #scenario.h2("launch")
    #scenario += c1.Agree(claim = False, cn = 1).run(sender = visitor)
    
    #scenario.h2("Finish_Contract owner")
    #scenario += c1.Finish_ContractOwner(cp = 0, mark = 10)
    
    #scenario.h2("Finish_Contract")
    #scenario += c1.Finish_ContractVisitor(cp = 0, mark = 10)
    
