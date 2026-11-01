
#ifndef SCHEDULER_H
#define SCHEDULER_H

#include "linkedlist.h"

typedef struct {
    int task_id;
    int burst_time;
    int completion_time;
    int turnaround_time;
    int waiting_time;
} TaskStats;

typedef struct {
    int task_id;
    int start_time;
    int end_time;
} Execution;

int runRoundRobinToFile(TaskList *list, int timeQuantum);

#endif
