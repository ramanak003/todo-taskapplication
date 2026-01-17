#!/bin/bash

# This script replaces the selectedDateTasks.map section with tasksByDate grouped display

sed -i '' '347,399d' app/upcoming/page.tsx

# Insert the new content at line 347
cat > /tmp/new_content.txt << 'EOF'
                          <div className="space-y-4 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-1 sm:pr-2">
                            {Object.entries(tasksByDate)
                              .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                              .map(([dateKey, dateTasks]) => {
                                const date = parseISO(dateKey)
                                const isSelectedDate = selectedDate && format(selectedDate, "yyyy-MM-dd") === dateKey
                                
                                return (
                                  <div 
                                    key={dateKey} 
                                    className={`border rounded-lg p-3 sm:p-4 transition-all ${
                                      isSelectedDate ? "border-primary bg-primary/5" : "border-border"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 mb-3">
                                      <IconCalendar className="h-4 w-4 text-primary" />
                                      <h3 className="font-semibold text-sm sm:text-base">
                                        {format(date, "EEEE, MMMM d, yyyy")}
                                      </h3>
                                      <Badge variant="outline" className="text-xs ml-auto">
                                        {dateTasks.length} task{dateTasks.length > 1 ? "s" : ""}
                                      </Badge>
                                    </div>
                                    <div className="space-y-2">
                                      {dateTasks.map((task) => (
                                        <div
                                          key={task.id}
                                          onClick={() => {
                                            setSelectedTask(task)
                                            setIsOverviewOpen(true)
                                          }}
                                          className="group p-3 rounded-md border hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer"
                                        >
                                          <div className="flex items-start justify-between gap-2 mb-2">
                                            <h4 className="font-semibold text-sm flex-1 group-hover:text-primary transition-colors line-clamp-1">
                                              {task.title}
                                            </h4>
                                            <div className="flex gap-1 shrink-0">
                                              <Badge 
                                                variant="outline" 
                                                className={`text-[10px] font-medium ${
                                                  task.priority === "high" ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 dark:border-red-700" :
                                                  task.priority === "medium" ? "border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-700" :
                                                  "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700"
                                                }`}
                                              >
                                                {task.priority}
                                              </Badge>
                                              <Badge variant="outline" className="text-[10px] capitalize">
                                                {task.status}
                                              </Badge>
                                            </div>
                                          </div>
                                          
                                          {task.description && (
                                            <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                                              {task.description}
                                            </p>
                                          )}

                                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                                            {task.deadline && (
                                              <div className="flex items-center gap-1">
                                                <IconClock className="h-3 w-3" />
                                                <span>Due: {format(parseISO(task.deadline), "MMM d")}</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )
                              })}
                          </div>
EOF

sed -i '' '346r /tmp/new_content.txt' app/upcoming/page.tsx

echo "File updated successfully"
