
#ifndef LINKEDLIST_H
#define LINKEDLIST_H

// Structure representing one task/node
typedef struct Task {
    int task_id;
    int burst_time;
    int remaining_time;
    struct Task *next;
} Task;

// Structure managing the circular linked list
typedef struct {
    Task *head;
    Task *tail;
    int size;
} TaskList;

// Function declarations
void initializeTaskList(TaskList *list);
int insertTask(TaskList *list, int id, int burstTime);
int deleteTask(TaskList *list, int id);
void displayTasks(const TaskList *list);
void freeTaskList(TaskList *list);

#endif
