#include <stdio.h>
#include <stdlib.h>
#include "linkedlist.h"

void initializeTaskList(TaskList *list) {
    if (list == NULL) {
        return;
    }

    list->head = NULL;
    list->tail = NULL;
    list->size = 0;
}


int insertTask(TaskList *list, int id, int burstTime) {

    // Validate input
    if (list == NULL || id <= 0 || burstTime <= 0) {
        return 0;
    }

    // Allocate memory for a new node
    Task *newTask = malloc(sizeof(Task));

    if (newTask == NULL) {
        return 0;
    }

    newTask->task_id = id;
    newTask->burst_time = burstTime;
    newTask->remaining_time = burstTime;

    if (list->head == NULL) {

        // First node in the circular linked list
        list->head = newTask;
        list->tail = newTask;

        // A single node points to itself
        newTask->next = newTask;

    } else {

        // Connect new node to the first node
        newTask->next = list->head;

        // Connect current last node to new node
        list->tail->next = newTask;

        // Update tail
        list->tail = newTask;
    }

    list->size++;

    return 1;
}


void displayTasks(const TaskList *list) {
    if (list == NULL || list->head == NULL) {
        printf("Task list is empty.\n");
        return;
    }

    // Keep the remaining code unchanged


    Task *current = list->head;

    printf("\n===== CIRCULAR TASK LIST =====\n");

    do {
        printf("Task ID: %d | Burst Time: %d | Remaining Time: %d\n",
               current->task_id,
               current->burst_time,
               current->remaining_time);

        current = current->next;

    } while (current != list->head);

    printf("Total tasks: %d\n", list->size);
    printf("==============================\n");
}

void freeTaskList(TaskList *list) {

    if (list == NULL || list->head == NULL) {
        return;
    }

    Task *current = list->head->next;

    while (current != list->head) {
        Task *temp = current;
        current = current->next;
        free(temp);
    }

    free(list->head);

    list->head = NULL;
    list->tail = NULL;
    list->size = 0;
}


int deleteTask(TaskList *list, int id) {

    // Check whether list is empty
    if (list == NULL || list->head == NULL) {
        return 0;
    }

    Task *current = list->head;
    Task *previous = list->tail;

    // Search for the task
    do {
        if (current->task_id == id) {
            break;
        }

        previous = current;
        current = current->next;

    } while (current != list->head);

    // Task not found
    if (current->task_id != id) {
        return 0;
    }

    // Case 1: Only one node exists
    if (list->head == list->tail) {

        list->head = NULL;
        list->tail = NULL;

    } else {

        // Connect previous node to next node
        previous->next = current->next;

        // Case 2: Deleting head
        if (current == list->head) {
            list->head = current->next;
        }

        // Case 3: Deleting tail
        if (current == list->tail) {
            list->tail = previous;
        }

        // Maintain circular connection
        list->tail->next = list->head;
    }

    // Release deleted node's memory
    free(current);

    list->size--;

    return 1;
}
