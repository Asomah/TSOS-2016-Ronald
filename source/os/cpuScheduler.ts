///<reference path="../globals.ts" />

module TSOS {
  
  export class CpuScheduler {

      public yell(){

          alert("NEED TO WORK AAAAAAAAAAAAAAAAAAAAA");
      }
      public roundRobin(){
          alert ("Checking Round Robin");
          if (_ClockTicks == _Quantum){
              //set clockTicks to 0
              _ClockTicks = 0;
              //perform context switching
              this.contextSwitch();

          }
          else if (_ClockTicks < _Quantum){
              _ClockTicks++;
              alert("Clock Ticks " + _ClockTicks);
          }
         
          
      }

      //Context switch 
      public contextSwitch(){
          //break and save all instances of current program 
           _CPU.executeProgram("00");

          //Load all instances of next program
          _CurrentProgram = this.getNextprogram();
          _CPU.startIndex = _CurrentProgram.startIndex;
          _CPU.PC = _CurrentProgram.PC;
          _CPU.Acc = _CurrentProgram.Acc;
          _CPU.Xreg = _CurrentProgram.Xreg;
          _CPU.Yreg = _CurrentProgram.Xreg;
          _CPU.Zflag = _CurrentProgram.Zflag;

      }
      public getNextprogram(){
          var nextProgram = new Pcb();
          if (_ReadyQueue.length == 1){
              var nextProgram = _CurrentProgram;
          }
          else{
            for (var i = 0; i < _ReadyQueue.length; i++){
                //Get next program in queue
                if (_CurrentProgram.PID == _ReadyQueue[i].PID){
                    //set next program to the program in the begining of the queue if the last program in queue is curreent
                    if (i == _ReadyQueue.length-1){
                        nextProgram = _ReadyQueue[0];
                    }
                    else{
                    nextProgram = _ReadyQueue[i+1];
                    }
                    alert(_CurrentProgram.PID + " " + nextProgram.PID);
                    break;
                    
                }
            }
          }

          return nextProgram;
          
      }

     }

  }