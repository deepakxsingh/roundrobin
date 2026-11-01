
#include <stdio.h>
#include "linkedlist.h"
#include "scheduler.h"

int main() {

    FILE *input = fopen("input.txt", "r");

    if (!input) {
        printf("Cannot open input.txt\n");
        return 1;
    }

    int quantum, totalTasks;

    if (fscanf(input, "%d%d", &quantum, &totalTasks) != 2 ||
        quantum <= 0 || totalTasks <= 0) {
        printf("Invalid input file.\n");
        fclose(input);
        return 1;
    }

    TaskList tasks;
    initializeTaskList(&tasks);

    for (int i = 0; i < totalTasks; i++) {

        int id, burst;

        if (fscanf(input, "%d%d", &id, &burst) != 2 ||
            id <= 0 || burst <= 0 ||
            !insertTask(&tasks, id, burst)) {

            printf("Invalid task data.\n");
            fclose(input);
            freeTaskList(&tasks);
            return 1;
        }
    }

    fclose(input);

    if (runRoundRobinToFile(&tasks, quantum))
        printf("Scheduling complete. output.json generated.\n");
    else
        printf("Scheduling failed.\n");

    freeTaskList(&tasks);

    return 0;
}
