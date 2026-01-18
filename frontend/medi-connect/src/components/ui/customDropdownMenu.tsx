"use client"

import * as React from "react"

import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu"
import { ChevronDown, ChevronUp } from "lucide-react"

type dropDownItem = {

  value: string,
}

type dropDownProps = {
  title: string,
  desc?: string,
  data: dropDownItem[],
  value?: string,
  onChange?: (value: string) => void
}

export function CustomDropdownMenu({
  title,
  desc,
  data,
  value = '',
  onChange
}: dropDownProps) {
  const [position, setPosition] = React.useState(value || '')
  const [isDown ,setIsDown] = React.useState(true)


  const handleChange = (value: string) => {
    setPosition(value)
    onChange?.(value)
  }

  return (
    <DropdownMenu onOpenChange={() => setIsDown(!isDown)}>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <Button variant="outline">
          {title + ' - ' + position}
          {isDown ? <ChevronDown /> : <ChevronUp />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {desc && (<>
          <DropdownMenuLabel>{desc}</DropdownMenuLabel>
          <DropdownMenuSeparator /></>)}
        <DropdownMenuRadioGroup value={position} onValueChange={handleChange}>
          {data?.map((item, index) => (

            <DropdownMenuRadioItem key={index} value={item.value}>{item.value}</DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
