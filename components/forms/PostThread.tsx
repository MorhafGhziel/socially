"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";
import { ThreadValidation } from "@/lib/validations/thread";
import { useOrganization } from "@clerk/nextjs";
import { Form, FormItem, FormLabel, FormControl, FormField } from "../ui/form";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { createThread } from "@/lib/actions/thread.actions";
import { z } from "zod";

function PostThread({ userId }: { userId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { organization } = useOrganization();

  const form = useForm<z.infer<typeof ThreadValidation>>({
    resolver: zodResolver(ThreadValidation),
    defaultValues: {
      thread: "",
      accountId: userId,
    },
  });

  const onSubmit = async (values: z.infer<typeof ThreadValidation>) => {
    try {
      console.log("Submitting thread with values:", values);
      const result = await createThread({
        text: values.thread,
        author: userId,
        communityId: null,
        path: pathname,
      });
      console.log("Thread created successfully:", result);
      form.reset();
      router.push("/");
    } catch (error) {
      console.error("Error submitting thread:", error);
    }
  };

  return (
    <div className="mt-10 flex flex-col justify-start gap-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="thread"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-3 w-full">
                <FormLabel className="text-base-semibold text-light-2">
                  Content
                </FormLabel>
                <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
                  <Textarea rows={15} {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" className="bg-primary-500 mt-5">
            Post Thread
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default PostThread;
