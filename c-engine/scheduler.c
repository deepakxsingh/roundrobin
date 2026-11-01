
#include <stdio.h>
#include <stdlib.h>
#include "scheduler.h"

int runRoundRobinToFile(TaskList *list, int timeQuantum) {

    if (list == NULL || list->head == NULL || timeQuantum <= 0)
        return 0;

    int totalTasks = list->size;
    int currentTime = 0;
    int index = 0;

    TaskStats *stats = malloc(totalTasks * sizeof(TaskStats));
    if (!stats) return 0;

    Task *current = list->head;

    do {
        stats[index].task_id = current->task_id;
        stats[index].burst_time = current->burst_time;
        stats[index].completion_time = 0;
        index++;
        current = current->next;
    } while (current != list->head);

    int maxExecutions = 0;

    for (int i = 0; i < totalTasks; i++)
        maxExecutions += (stats[i].burst_time + timeQuantum - 1) / timeQuantum;

    Execution *history = malloc(maxExecutions * sizeof(Execution));
    if (!history) {
        free(stats);
        return 0;
    }

    int executionCount = 0;
    current = list->head;

    while (list->head != NULL) {

        int executionTime = current->remaining_time < timeQuantum
                          ? current->remaining_time : timeQuantum;

        int startTime = currentTime;

        current->remaining_time -= executionTime;
        currentTime += executionTime;

        history[executionCount++] = (Execution) {
            current->task_id, startTime, currentTime
        };

        if (current->remaining_time == 0) {

            int completedID = current->task_id;
            Task *nextTask = current->next;

            for (int i = 0; i < totalTasks; i++) {
                if (stats[i].task_id == completedID) {
                    stats[i].completion_time = currentTime;
                    break;
                }
            }

            deleteTask(list, completedID);

            if (list->head == NULL) break;

            current = nextTask;
        } else {
            current = current->next;
        }
    }

    int totalWT = 0;
    int totalTAT = 0;

    FILE *file = fopen("output.json", "w");

    if (!file) {
        free(history);
        free(stats);
        return 0;
    }

    fprintf(file, "{\n\"quantum\":%d,\n", timeQuantum);

    fprintf(file, "\"executions\":[");
    for (int i = 0; i < executionCount; i++) {
        fprintf(file,
            "%s{\"id\":%d,\"start\":%d,\"end\":%d}",
            i ? "," : "",
            history[i].task_id,
            history[i].start_time,
            history[i].end_time);
    }
    fprintf(file, "],\n\"statistics\":[");

    for (int i = 0; i < totalTasks; i++) {
        stats[i].turnaround_time = stats[i].completion_time;
        stats[i].waiting_time =
            stats[i].turnaround_time - stats[i].burst_time;

        totalWT += stats[i].waiting_time;
        totalTAT += stats[i].turnaround_time;

        fprintf(file,
            "%s{\"id\":%d,\"burstTime\":%d,\"completionTime\":%d,"
            "\"turnaroundTime\":%d,\"waitingTime\":%d}",
            i ? "," : "",
            stats[i].task_id,
            stats[i].burst_time,
            stats[i].completion_time,
            stats[i].turnaround_time,
            stats[i].waiting_time);
    }

    fprintf(file, "],\n");
    fprintf(file, "\"averageWT\":%.2f,\n",
            (float)totalWT / totalTasks);
    fprintf(file, "\"averageTAT\":%.2f\n",
            (float)totalTAT / totalTasks);
    fprintf(file, "}\n");

    fclose(file);

    free(history);
    free(stats);

    return 1;
}
