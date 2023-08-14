/* eslint-disable react-hooks/rules-of-hooks */
"use client";

// import NavBar from "@/components/NavBar";
import Link from "next/link";
import React, { Suspense,useState } from "react";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { cn } from "@/lib/utils"
import { generateDate, months } from "@/components/ui/calendar";
import dayjs from "dayjs";
import AddTaskIcon from '@mui/icons-material/AddTask';

export default function page() {

    const days = ["S", "M", "T", "W", "T", "F", "S"];
	const currentDate = dayjs();
	const [today, setToday] = useState(currentDate);
	const [selectDate, setSelectDate] = useState(currentDate);

    return (
        <section className="p-4 sm:ml-64 h-128 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            {/* 
            <Suspense fallback={<p>Loading feed...</p>}>
                <p className="text-gray-900">hiiiii</p>
            </Suspense> */}

            <div className="w-full h-20 flex items-center justify-between p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:bg-gray-700 group">
                <div>Organize Your Life </div>
				<button className="w-40 flex items-center justify-evenly p-2 rounded-lg text-white bg-green-500 group" onClick={(e)=>alert("not now")}>
					<AddTaskIcon />
					Add Event
				</button>
            </div><br />

            <div className="w-full h-228 flex items-center justify-evenly p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:bg-gray-700 group">
            <div className="w-96 h-96 ">
				<div className="flex justify-between items-center">
					<h1 className="select-none font-semibold">
						{months[today.month()]}, {today.year()}
					</h1>
					<div className="flex gap-10 items-center ">
						<GrFormPrevious
							className="w-5 h-5 cursor-pointer hover:scale-105 transition-all"
							onClick={() => {
								setToday(today.month(today.month() - 1));
							}}
						/>
						<h1
							className=" cursor-pointer hover:scale-105 transition-all"
							onClick={() => {
								setToday(currentDate);
							}}
						>
							Today
						</h1>
						<GrFormNext
							className="w-5 h-5 cursor-pointer hover:scale-105 transition-all"
							onClick={() => {
								setToday(today.month(today.month() + 1));
							}}
						/>
					</div>
				</div>
				<div className="grid grid-cols-7 ">
					{days.map((day, index) => {
						return (
							<h1
								key={index}
								className="text-sm text-center h-14 w-14 grid place-content-center text-gray-500 select-none"
							>
								{day}
							</h1>
						);
					})}
				</div>

				<div className=" grid grid-cols-7 ">
					{generateDate(today.month(), today.year()).map(
						({ date, currentMonth, today }, index) => {
							return (
								<div
									key={index}
									className="p-2 text-center h-14 grid place-content-center text-sm border-t"
								>
									<h1
										className={cn(
											currentMonth ? "" : "text-gray-400",
											today
												? "bg-red-600 text-white"
												: "",
											selectDate
												.toDate()
												.toDateString() ===
												date.toDate().toDateString()
												? "bg-black text-white"
												: "",
											"h-10 w-10 rounded-full grid place-content-center hover:bg-black hover:text-white transition-all cursor-pointer select-none"
										)}
										onClick={() => {
											setSelectDate(date);
										}}
									>
										{date.date()}
									</h1>
								</div>
							);
						}
					)}
				</div>
			</div>
			<div className="h-96 w-96 sm:px-5">
				<h1 className=" font-semibold">
					Schedule for {selectDate.toDate().toDateString()}
				</h1>
				<p className="text-gray-400">No meetings for today.</p>
			</div>
            </div>
        </section>
    );
}