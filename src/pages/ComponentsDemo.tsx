import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card";

export default function ComponentsDemo() {
  return (
    <div className="min-h-screen  p-8">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Header */}
        <div className="space-y-2">
          <h1 className=" font-bold ">UI Components Demo</h1>
          <p className="">
            Showcasing Button, Input, Label, and Card components with Toss
            Payments theme
          </p>
        </div>

        {/* Badge Component Section */}
        <Card>
          <CardHeader>
            <CardTitle>Badge Component</CardTitle>
            <CardDescription>
              Status badges with 5 color variants and multiple sizes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Badge Variants */}
            <div className="space-y-3">
              <h3 className=" font-semibold ">Color Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Badge variant="default">Default</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="error">Error</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="neutral">Neutral</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </div>

            {/* Badge Sizes */}
            <div className="space-y-3">
              <h3 className=" font-semibold">Sizes</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Badge size="sm" variant="success">
                  Small
                </Badge>
                <Badge size="default" variant="success">
                  Default
                </Badge>
                <Badge size="lg" variant="success">
                  Large
                </Badge>
              </div>
            </div>

            {/* Badge Use Cases */}
            <div className="space-y-3">
              <h3 className="text-primary font-semibold">
                Real-world Examples
              </h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className="">Order Status:</span>
                  <Badge variant="success">Completed</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="">Payment:</span>
                  <Badge variant="warning">Pending</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="">Verification:</span>
                  <Badge variant="error">Failed</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="">Notification:</span>
                  <Badge variant="info">3 New</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="">Role:</span>
                  <Badge variant="neutral">Admin</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Button Component Section */}
        <Card>
          <CardHeader>
            <CardTitle>Button Component</CardTitle>
            <CardDescription>
              Various button variants and sizes with extensible props
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Button Variants */}
            <div className="space-y-3">
              <h3 className=" font-semibold">Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="default">Default</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>

            {/* Button Sizes */}
            <div className="space-y-3">
              <h3 className="font-semibold ">Sizes</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            {/* Icon Buttons */}
            <div className="space-y-3">
              <h3 className="font-semibold ">Icon Buttons</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="icon-sm" variant="outline">
                  <span>+</span>
                </Button>
                <Button size="icon" variant="outline">
                  <span>✓</span>
                </Button>
                <Button size="icon-lg" variant="outline">
                  <span>→</span>
                </Button>
              </div>
            </div>

            {/* Disabled State */}
            <div className="space-y-3">
              <h3 className=" font-semibold ">Disabled State</h3>
              <div className="flex flex-wrap gap-3">
                <Button disabled>Disabled Default</Button>
                <Button variant="outline" disabled>
                  Disabled Outline
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input Component Section */}
        <Card>
          <CardHeader>
            <CardTitle>Input Component</CardTitle>
            <CardDescription>
              Text input with various states and configurations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Input */}
            <div className="space-y-3">
              <h3 className="font-semibold">Basic Input</h3>
              <div className="max-w-md">
                <Input placeholder="Enter text here..." />
              </div>
            </div>

            {/* Input Types */}
            <div className="space-y-3">
              <h3 className="font-semibold">Input Types</h3>
              <div className="grid max-w-md gap-3">
                <Input type="text" placeholder="Text input" />
                <Input type="email" placeholder="Email input" />
                <Input type="password" placeholder="Password input" />
                <Input type="number" placeholder="Number input" />
              </div>
            </div>

            {/* Disabled Input */}
            <div className="space-y-3">
              <h3 className="font-semibold ">Disabled State</h3>
              <div className="max-w-md">
                <Input disabled placeholder="Disabled input" />
              </div>
            </div>

            {/* File Input */}
            <div className="space-y-3">
              <h3 className="font-semibold ">File Input</h3>
              <div className="max-w-md">
                <Input type="file" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Label Component Section */}
        <Card>
          <CardHeader>
            <CardTitle>Label Component</CardTitle>
            <CardDescription>
              Accessible labels for form inputs with proper associations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Label with Input */}
            <div className="space-y-3">
              <h3 className=" font-semibold ">Label with Input</h3>
              <div className="grid max-w-md gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" placeholder="Enter username" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" />
                </div>
              </div>
            </div>

            {/* Required Field */}
            <div className="space-y-3">
              <h3 className=" font-semibold ">Required Field</h3>
              <div className="max-w-md space-y-2">
                <Label htmlFor="required">
                  Full Name{" "}
                  <span className="text-[rgb(var(--color-primary))]">*</span>
                </Label>
                <Input id="required" placeholder="Required field" required />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Component Section */}
        <Card>
          <CardHeader>
            <CardTitle>Card Component</CardTitle>
            <CardDescription>
              Flexible card container with header, content, footer, and action
              sections
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h3 className=" font-semibold ">Card Examples</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Simple Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Simple Card</CardTitle>
                    <CardDescription>A basic card example</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className=" text-[rgb(var(--color-text-tertiary))]">
                      This is a simple card with header and content sections.
                    </p>
                  </CardContent>
                </Card>

                {/* Card with Footer */}
                <Card>
                  <CardHeader>
                    <CardTitle>Card with Footer</CardTitle>
                    <CardDescription>Includes action buttons</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className=" text-[rgb(var(--color-text-tertiary))]">
                      This card demonstrates footer usage with action buttons.
                    </p>
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button variant="outline" size="sm">
                      Cancel
                    </Button>
                    <Button size="sm">Confirm</Button>
                  </CardFooter>
                </Card>

                {/* Card with Action */}
                <Card>
                  <CardHeader>
                    <CardTitle>Card with Action</CardTitle>
                    <CardDescription>Header action button</CardDescription>
                    <CardAction>
                      <Button variant="ghost" size="icon-sm">
                        ⋮
                      </Button>
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    <p className=" text-[rgb(var(--color-text-tertiary))]">
                      This card has an action button in the header.
                    </p>
                  </CardContent>
                </Card>

                {/* Complete Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Complete Example</CardTitle>
                    <CardDescription>All card sections</CardDescription>
                    <CardAction>
                      <Button variant="ghost" size="icon-sm">
                        ✕
                      </Button>
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    <p className=" text-[rgb(var(--color-text-tertiary))]">
                      This demonstrates all available card sections working
                      together.
                    </p>
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button variant="secondary" size="sm">
                      Learn More
                    </Button>
                    <Button size="sm">Get Started</Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Example */}
        <Card>
          <CardHeader>
            <CardTitle>Complete Form Example</CardTitle>
            <CardDescription>
              All components working together in a realistic form
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="formEmail">
                  Email{" "}
                  <span className="text-[rgb(var(--color-primary))]">*</span>
                </Label>
                <Input
                  id="formEmail"
                  type="email"
                  placeholder="john.doe@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Input id="message" placeholder="Your message here..." />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline">
                  Reset
                </Button>
                <Button type="submit">Submit</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
